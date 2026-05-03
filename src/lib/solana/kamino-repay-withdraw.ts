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

import {
  decimalToBaseUnits,
  getAdapterCatalogEntry,
} from "./adapter-catalog";
import { getSolanaRpc, getSolanaWeb3Connection } from "./connection";
import {
  KAMINO_PROTOCOL_METADATA,
  SOL_MINT_ADDRESS,
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

const ENTRY = getAdapterCatalogEntry("kamino-repay-and-withdraw")!;
const CATALOG_ITEM = ENTRY.catalogItem;
const WIDGETS: WidgetSchema[] = ENTRY.widgets;

const SOL_DECIMALS = 9;

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
  // Action-only adapter — the supply-and-borrow obligation it operates
  // on is surfaced by kamino-borrow.ts's readPosition.
  void params;
  return null;
}

async function readRate(): Promise<APYQuote | null> {
  // No yield. Borrow APY (cost) is on the supply-and-borrow node.
  return null;
}

async function buildTransaction(
  params: BuildTransactionParams,
): Promise<BuildTransactionResult> {
  // Repay amount: input USDC base units. derive-executable-plan
  // converts the `amount` widget via decimalToBaseUnits(value, 6).
  const repayRaw = params.inputAmount;
  if (repayRaw <= 0n) {
    throw new Error(
      `Kamino repay+withdraw requires a positive USDC repay amount (got ${repayRaw.toString()})`,
    );
  }

  // Collateral withdraw amount: separate widget (in SOL decimal).
  const collateralWidget = params.widgets.collateralAmount;
  if (typeof collateralWidget !== "number" || collateralWidget <= 0) {
    throw new Error(
      `Kamino repay+withdraw requires a positive collateralAmount widget (got ${typeof collateralWidget === "number" ? collateralWidget.toString() : "undefined"}).`,
    );
  }
  const collateralLamports = decimalToBaseUnits(collateralWidget, SOL_DECIMALS);
  if (collateralLamports === null || collateralLamports <= 0n) {
    throw new Error(
      `Kamino repay+withdraw: collateralAmount could not be converted to SOL base units.`,
    );
  }

  const market = await loadKaminoMainMarket();
  const rpc = getSolanaRpc();

  // Scope refresh same as the other Kamino adapters that touch debt
  // positions — without it, ObligationStale on simulation.
  const scope = new Scope(
    "mainnet-beta",
    rpc as unknown as ConstructorParameters<typeof Scope>[1],
  );
  const scopeConfigurations = await scope.getAllConfigurations();
  const scopeRefreshConfig = { scope, scopeConfigurations };

  const owner = createNoopSigner(address(params.walletPublicKey));
  const obligation = new VanillaObligation(PROGRAM_ID);

  // buildRepayTxns also needs currentSlot.
  const currentSlot = await rpc.getSlot().send();

  // Two separate SDK calls — same recipe that worked for the
  // supply-and-borrow adapter. The combined buildRepayAndWithdrawTxns
  // would interleave inBetweenIxs between repay and withdraw, blowing
  // the 1232-byte single-tx ceiling. Splitting gives each its own
  // self-contained refresh setup. Trade-off: lost cross-tx atomicity
  // (if withdraw fails after repay succeeds, debt is paid but
  // collateral stays locked). Acceptable for hackathon scope; a
  // future LUT-based path can recombine.

  type RepayArgs = Parameters<typeof KaminoAction.buildRepayTxns>;
  const repayAction = await KaminoAction.buildRepayTxns(
    market as unknown as RepayArgs[0],
    repayRaw.toString(),
    address(USDC_MINT_ADDRESS) as unknown as RepayArgs[2],
    owner as unknown as RepayArgs[3],
    obligation as unknown as RepayArgs[4],
    true, // useV2Ixs
    scopeRefreshConfig as unknown as RepayArgs[6],
    currentSlot as unknown as RepayArgs[7],
  );

  type WithdrawArgs = Parameters<typeof KaminoAction.buildWithdrawTxns>;
  const withdrawAction = await KaminoAction.buildWithdrawTxns(
    market as unknown as WithdrawArgs[0],
    collateralLamports.toString(),
    address(SOL_MINT_ADDRESS) as unknown as WithdrawArgs[2],
    owner as unknown as WithdrawArgs[3],
    obligation as unknown as WithdrawArgs[4],
    true, // useV2Ixs
    scopeRefreshConfig as unknown as WithdrawArgs[6],
  );

  const Static = KaminoAction as unknown as KaminoActionStatic;
  const repayIxs = Static.actionToIxs(repayAction) as KitInstruction[];
  const repayLabels = Static.actionToIxLabels(repayAction);
  const withdrawIxs = Static.actionToIxs(withdrawAction) as KitInstruction[];
  const withdrawLabels = Static.actionToIxLabels(withdrawAction);

  // Init ixs (idempotent) split off; should be empty for any user who
  // already has the obligation we're repaying against. Pull from
  // BOTH actions just to be safe.
  const initKitIxs: KitInstruction[] = [];
  const repayMainIxs: KitInstruction[] = [];
  const withdrawMainIxs: KitInstruction[] = [];
  for (let i = 0; i < repayIxs.length; i++) {
    if (isInitIx(repayLabels[i] ?? "")) {
      initKitIxs.push(repayIxs[i]);
    } else {
      repayMainIxs.push(repayIxs[i]);
    }
  }
  for (let i = 0; i < withdrawIxs.length; i++) {
    if (isInitIx(withdrawLabels[i] ?? "")) {
      initKitIxs.push(withdrawIxs[i]);
    } else {
      withdrawMainIxs.push(withdrawIxs[i]);
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
        `kamino-repay-withdraw ${label}: serialize failed (${web3Ixs.length} ixs) — ${err instanceof Error ? err.message : String(err)}`,
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
    buildVersionedTx(repayMainIxs.map(kitIxToWeb3Ix), "repay"),
  );
  transactionsBase64.push(
    buildVersionedTx(withdrawMainIxs.map(kitIxToWeb3Ix), "withdraw"),
  );

  // Output amount is the SOL collateral being withdrawn (in lamports).
  // Downstream consumers (e.g., a Jupiter swap chained after to convert
  // back to USDC) will see this amount.
  return {
    transactionsBase64,
    expectedOutputAmount: collateralLamports,
    fees: {
      networkLamports: 5000n,
    },
    warnings: [
      "Repay + withdraw runs as separate transactions. If withdraw fails after repay succeeds, your debt is paid but collateral remains supplied; you can run the Withdraw USDC node (or a manual Kamino withdraw of SOL) to reclaim it.",
    ],
  };
}

export const kaminoRepayAndWithdrawAdapter: ProtocolAdapter = {
  catalogItemId: CATALOG_ITEM.id,
  catalogItem: CATALOG_ITEM,
  widgets: WIDGETS,
  protocol: KAMINO_PROTOCOL_METADATA,
  readPosition,
  readRate,
  buildTransaction,
};
