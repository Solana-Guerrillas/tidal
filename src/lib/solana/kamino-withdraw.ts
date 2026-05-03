import "server-only";

import {
  KaminoAction,
  PROGRAM_ID,
  VanillaObligation,
} from "@kamino-finance/klend-sdk";
import { Scope } from "@kamino-finance/scope-sdk";
import { address } from "@solana/kit";
import { createNoopSigner } from "@solana/signers";
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import { getAdapterCatalogEntry } from "./adapter-catalog";
import { getSolanaRpc, getSolanaWeb3Connection } from "./connection";
import {
  KAMINO_PROTOCOL_METADATA,
  USDC_MINT_ADDRESS,
  kitIxToWeb3Ix,
  loadKaminoMainMarket,
  type KitInstruction,
} from "./kamino-shared";
import type {
  APYQuote,
  BuildTransactionParams,
  BuildTransactionResult,
  PositionSnapshot,
  ProtocolAdapter,
  ReadPositionParams,
  WidgetSchema,
} from "./types";

const ENTRY = getAdapterCatalogEntry("kamino-usdc-withdraw")!;
const CATALOG_ITEM = ENTRY.catalogItem;
const WIDGETS: WidgetSchema[] = ENTRY.widgets;

// Same init-ix label split we use in the borrow adapter. New users (no
// existing obligation) would never trigger withdraw, but the SDK still
// emits no-op init ixs in some paths; pulling them into a separate tx
// keeps the main withdraw tx slim if the SDK ever adds bytes here.
const INIT_IX_LABEL_PREFIXES = [
  "createUserLutIx",
  "initUserMetadata",
  "InitObligation",
];

function isInitIx(label: string): boolean {
  return INIT_IX_LABEL_PREFIXES.some((prefix) => label.startsWith(prefix));
}

type KaminoActionStatic = {
  actionToIxs: (a: KaminoAction) => unknown[];
  actionToIxLabels: (a: KaminoAction) => string[];
};

async function readPosition(
  params: ReadPositionParams,
): Promise<PositionSnapshot | null> {
  // The withdraw adapter is action-only — its "position" is the same
  // underlying Kamino USDC supply that the kamino-usdc-supply adapter
  // already surfaces. Returning null avoids double-counting in the
  // Investments panel.
  void params;
  return null;
}

async function readRate(): Promise<APYQuote | null> {
  // Withdraw doesn't have a yield. The supply adapter reports the live
  // supply APY for the underlying position.
  return null;
}

async function buildTransaction(
  params: BuildTransactionParams,
): Promise<BuildTransactionResult> {
  // inputAmount arrives in USDC base units (6 decimals). When this node
  // is dropped standalone with a widget value, derive-executable-plan
  // converts the amount widget via decimalToBaseUnits(value, 6). When
  // it's wired downstream of a Kamino supply, the supply's
  // expectedOutputAmount (also USDC raw units) feeds in directly.
  const amount = params.inputAmount;
  if (amount <= 0n) {
    throw new Error(
      `Kamino withdraw requires a positive amount (got ${amount.toString()})`,
    );
  }

  const market = await loadKaminoMainMarket();

  // Scope refresh so the obligation isn't ObligationStale at withdraw
  // time. Same construction as the borrow adapter.
  const rpc = getSolanaRpc();
  const scope = new Scope(
    "mainnet-beta",
    rpc as unknown as ConstructorParameters<typeof Scope>[1],
  );
  const scopeConfigurations = await scope.getAllConfigurations();
  const scopeRefreshConfig = { scope, scopeConfigurations };

  const owner = createNoopSigner(address(params.walletPublicKey));
  const obligation = new VanillaObligation(PROGRAM_ID);

  type WithdrawArgs = Parameters<typeof KaminoAction.buildWithdrawTxns>;
  // useV2Ixs=true: same reasoning as deposit-and-borrow — V2 batches
  // the farm refresh internally; V1 expects an external position-
  // sensitive farm refresh ix that the SDK won't insert.
  const kaminoAction = await KaminoAction.buildWithdrawTxns(
    market as unknown as WithdrawArgs[0],
    amount.toString(),
    address(USDC_MINT_ADDRESS) as unknown as WithdrawArgs[2],
    owner as unknown as WithdrawArgs[3],
    obligation as unknown as WithdrawArgs[4],
    true, // useV2Ixs
    scopeRefreshConfig as unknown as WithdrawArgs[6],
  );

  // Use the SDK's canonical assembly so inBetweenIxs (if any — withdraw
  // is single-lending-ix, so usually empty) are interleaved correctly.
  const Static = KaminoAction as unknown as KaminoActionStatic;
  const allKitIxs = Static.actionToIxs(kaminoAction) as KitInstruction[];
  const allLabels = Static.actionToIxLabels(kaminoAction);

  const initKitIxs: KitInstruction[] = [];
  const mainKitIxs: KitInstruction[] = [];
  for (let i = 0; i < allKitIxs.length; i++) {
    if (isInitIx(allLabels[i] ?? "")) {
      initKitIxs.push(allKitIxs[i]);
    } else {
      mainKitIxs.push(allKitIxs[i]);
    }
  }

  const connection = getSolanaWeb3Connection();
  const fromPubkey = new PublicKey(params.walletPublicKey);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");

  const buildVersionedTx = (
    web3Ixs: TransactionInstruction[],
    label: string,
  ): string => {
    const message = new TransactionMessage({
      payerKey: fromPubkey,
      recentBlockhash: blockhash,
      instructions: web3Ixs,
    }).compileToV0Message();
    const tx = new VersionedTransaction(message);
    try {
      const serialized = tx.serialize();
      return Buffer.from(serialized).toString("base64");
    } catch (err) {
      throw new Error(
        `kamino-withdraw ${label}: serialize failed (${web3Ixs.length} ixs) — ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const transactionsBase64: string[] = [];
  if (initKitIxs.length > 0) {
    transactionsBase64.push(
      buildVersionedTx(initKitIxs.map(kitIxToWeb3Ix), "init"),
    );
  }
  transactionsBase64.push(
    buildVersionedTx(mainKitIxs.map(kitIxToWeb3Ix), "withdraw"),
  );

  // Output is the requested amount in USDC raw units. Actual amount
  // received may be slightly higher than the user's last-deposited
  // amount once accrued interest is included — Kamino's kToken
  // exchange rate appreciates over time. For a downstream consumer
  // (e.g., a Jupiter swap chained after the withdraw), passing the
  // requested amount is a safe lower bound.
  return {
    transactionsBase64,
    expectedOutputAmount: amount,
    fees: {
      networkLamports: 5000n,
    },
    warnings: [
      "Withdrawing more than you have supplied (or more than the available liquidity) will fail at simulation. The Investments panel shows your current Kamino USDC balance.",
    ],
  };
}

export const kaminoUsdcWithdrawAdapter: ProtocolAdapter = {
  catalogItemId: CATALOG_ITEM.id,
  catalogItem: CATALOG_ITEM,
  widgets: WIDGETS,
  protocol: KAMINO_PROTOCOL_METADATA,
  readPosition,
  readRate,
  buildTransaction,
};
