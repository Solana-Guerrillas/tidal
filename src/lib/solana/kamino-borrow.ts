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

const ENTRY = getAdapterCatalogEntry("kamino-supply-and-borrow")!;
const CATALOG_ITEM = ENTRY.catalogItem;
const WIDGETS: WidgetSchema[] = ENTRY.widgets;

const USDC_DECIMALS = 6;

async function readPosition(
  params: ReadPositionParams,
): Promise<PositionSnapshot | null> {
  // Borrow obligations contain both supplied collateral and outstanding
  // debt. Real position reads (supplied SOL, borrowed USDC, current
  // health factor) are deferred to the investment-tracker work in Tier
  // 1 #4. Returning null until then avoids surfacing partial data.
  void params;
  return null;
}

async function readRate(): Promise<APYQuote | null> {
  // The cost surfaced on the strategy node here is the *borrow* APY, not
  // a supply yield. We intentionally return null so the static
  // "variable" placeholder stays visible in the UI; real
  // borrowReserve.totalBorrowAPY() reads land alongside the position
  // tracker work.
  return null;
}

async function buildTransaction(
  params: BuildTransactionParams,
): Promise<BuildTransactionResult> {
  const collateralLamports = params.inputAmount;
  if (collateralLamports <= 0n) {
    throw new Error(
      `Kamino supply-and-borrow requires a positive collateral amount (got ${collateralLamports.toString()})`,
    );
  }

  const borrowWidget = params.widgets.borrowAmount;
  if (typeof borrowWidget !== "number" || borrowWidget <= 0) {
    throw new Error(
      `Kamino supply-and-borrow requires a positive borrowAmount widget (got ${typeof borrowWidget === "number" ? borrowWidget.toString() : "undefined"}).`,
    );
  }
  const borrowRaw = decimalToBaseUnits(borrowWidget, USDC_DECIMALS);
  if (borrowRaw === null || borrowRaw <= 0n) {
    throw new Error(
      `Kamino supply-and-borrow: borrowAmount could not be converted to USDC base units.`,
    );
  }

  const market = await loadKaminoMainMarket();

  // Borrowing requires fresh oracle prices for every reserve in the
  // obligation. Without a scopeRefreshConfig, the simulation fails with
  // ObligationStale (price status bitmask 00111111 = all 6 reserves
  // stale). The SDK injects RefreshScope ixs at the front of the tx
  // when we provide this config.
  const rpc = getSolanaRpc();
  const scope = new Scope(
    "mainnet-beta",
    rpc as unknown as ConstructorParameters<typeof Scope>[1],
  );
  const scopeConfigurations = await scope.getAllConfigurations();
  const scopeRefreshConfig = { scope, scopeConfigurations };

  const owner = createNoopSigner(address(params.walletPublicKey));
  const obligation = new VanillaObligation(PROGRAM_ID);

  type DepositAndBorrowArgs = Parameters<
    typeof KaminoAction.buildDepositAndBorrowTxns
  >;
  // useV2Ixs=true: V1 instructions for deposit-and-borrow expect a
  // RefreshFarmsForObligationForReserve ix at a specific preceding
  // position which the SDK doesn't insert; V2 instructions batch the
  // farm refresh internally.
  const kaminoAction = await KaminoAction.buildDepositAndBorrowTxns(
    market as unknown as DepositAndBorrowArgs[0],
    collateralLamports.toString(),
    address(SOL_MINT_ADDRESS) as unknown as DepositAndBorrowArgs[2],
    borrowRaw.toString(),
    address(USDC_MINT_ADDRESS) as unknown as DepositAndBorrowArgs[4],
    owner as unknown as DepositAndBorrowArgs[5],
    obligation as unknown as DepositAndBorrowArgs[6],
    true, // useV2Ixs
    scopeRefreshConfig as unknown as DepositAndBorrowArgs[8],
  );

  const allKitIxs = [
    ...kaminoAction.setupIxs,
    ...kaminoAction.lendingIxs,
    ...kaminoAction.cleanupIxs,
  ] as unknown as KitInstruction[];

  const web3Ixs = allKitIxs.map(kitIxToWeb3Ix);

  const connection = getSolanaWeb3Connection();
  const fromPubkey = new PublicKey(params.walletPublicKey);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const message = new TransactionMessage({
    payerKey: fromPubkey,
    recentBlockhash: blockhash,
    instructions: web3Ixs,
  }).compileToV0Message();
  const tx = new VersionedTransaction(message);
  const transactionBase64 = Buffer.from(tx.serialize()).toString("base64");

  // Output amount is the borrowed USDC in raw base units (6 decimals).
  // That is what flows downstream as the entry-node "input" for any
  // wired-up consumer (e.g., a Jupiter swap that converts borrowed USDC
  // back into SOL for re-collateralization in a leverage loop).
  return {
    transactionBase64,
    expectedOutputAmount: borrowRaw,
    fees: {
      networkLamports: 5000n,
    },
    warnings: [
      "Borrowing requires healthy collateral. Kamino may reject or partially fill the tx if the requested borrow exceeds the LTV ceiling.",
    ],
  };
}

export const kaminoSupplyAndBorrowAdapter: ProtocolAdapter = {
  catalogItemId: CATALOG_ITEM.id,
  catalogItem: CATALOG_ITEM,
  widgets: WIDGETS,
  protocol: KAMINO_PROTOCOL_METADATA,
  readPosition,
  readRate,
  buildTransaction,
};
