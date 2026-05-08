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

const ENTRY = getAdapterCatalogEntry("kamino-supply-and-borrow")!;
const CATALOG_ITEM = ENTRY.catalogItem;
const WIDGETS: WidgetSchema[] = ENTRY.widgets;

const USDC_DECIMALS = 6;

// Setup-ix label prefixes that create new on-chain accounts. These are
// idempotent (skip-if-exists in the SDK) and can safely run as a
// standalone init tx — they take no part in the actual lending logic
// and pulling them out keeps the deposit/borrow txs slim enough to fit
// inside Solana's 1232-byte single-tx ceiling.
const INIT_IX_LABEL_PREFIXES = [
  "createUserLutIx",
  "initUserMetadata",
  "InitObligation", // also matches InitObligationForFarm
];

function isInitIx(label: string): boolean {
  return INIT_IX_LABEL_PREFIXES.some((prefix) => label.startsWith(prefix));
}

type KaminoActionStatic = {
  actionToIxs: (a: KaminoAction) => unknown[];
  actionToIxLabels: (a: KaminoAction) => string[];
};

function actionToOrderedIxs(
  action: KaminoAction,
): { ixs: KitInstruction[]; labels: string[] } {
  const Static = KaminoAction as unknown as KaminoActionStatic;
  return {
    ixs: Static.actionToIxs(action) as KitInstruction[],
    labels: Static.actionToIxLabels(action),
  };
}

async function readPosition(
  params: ReadPositionParams,
): Promise<PositionSnapshot | null> {
  const market = await loadKaminoMainMarket();
  type GetObligation = Parameters<typeof market.getObligationByWallet>;
  const obligation = await market.getObligationByWallet(
    address(params.walletPublicKey) as unknown as GetObligation[0],
    new VanillaObligation(PROGRAM_ID) as unknown as GetObligation[1],
  );
  if (!obligation) return null;

  const solMint = address(SOL_MINT_ADDRESS);
  const usdcMint = address(USDC_MINT_ADDRESS);

  // Collateral: SOL deposit. Debt: USDC borrow. Either may be absent
  // if the user has a Kamino position but not the SOL/USDC pair this
  // adapter cares about — return null so the supply adapter takes
  // primary responsibility for surfacing pure USDC supply positions.
  const deposits = obligation.getDeposits();
  const borrows = obligation.getBorrows();
  const solCollateral = deposits.find(
    (p) => p.mintAddress.toString() === solMint.toString(),
  );
  const usdcDebt = borrows.find(
    (p) => p.mintAddress.toString() === usdcMint.toString(),
  );
  if (!solCollateral || !usdcDebt) return null;

  const collateralLamports = BigInt(solCollateral.amount.floor().toString());
  const collateralSol = Number(collateralLamports) / 1_000_000_000;
  const collateralUsd = Number(solCollateral.marketValueRefreshed);

  const debtRaw = BigInt(usdcDebt.amount.ceil().toString());
  const debtUsdc = Number(debtRaw) / 1_000_000;
  const debtUsd = Number(usdcDebt.marketValueRefreshed);

  // Health factor = total deposited USD value / total borrowed USD
  // value. Below 1.0 means the obligation is underwater. Above ~1.4
  // is the typical "comfortable" zone depending on reserve LTV.
  const healthFactor =
    debtUsd > 0
      ? Number(obligation.refreshedStats.userTotalDeposit) / debtUsd
      : undefined;

  return {
    asset: "SOL collateral (Kamino)",
    rawAmount: collateralLamports,
    displayAmount: `${collateralSol.toFixed(4)} SOL`,
    valueUsd: Number.isFinite(collateralUsd) ? collateralUsd : undefined,
    debt: {
      asset: "USDC borrowed",
      rawAmount: debtRaw,
      displayAmount: `${debtUsdc.toFixed(2)} USDC`,
      valueUsd: Number.isFinite(debtUsd) ? debtUsd : undefined,
    },
    healthFactor:
      healthFactor !== undefined && Number.isFinite(healthFactor)
        ? healthFactor
        : undefined,
    lastUpdatedAt: Date.now(),
  };
}

async function readRate(): Promise<APYQuote | null> {
  // Headline `apy` is the USDC *borrow* cost (this adapter has
  // apyType: "cost" in the catalog — the user pays this rate on
  // borrowed USDC). The full breakdown carries both rates so the
  // leverage-loop node can compute net effective yield client-side
  // without re-fetching: collateral leg earns SOL supply APY, debt
  // leg costs USDC borrow APY.
  const rpc = getSolanaRpc();
  const market = await loadKaminoMainMarket();
  const solReserve = market.getReserveByMint(
    address(SOL_MINT_ADDRESS) as unknown as Parameters<
      typeof market.getReserveByMint
    >[0],
  );
  const usdcReserve = market.getReserveByMint(
    address(USDC_MINT_ADDRESS) as unknown as Parameters<
      typeof market.getReserveByMint
    >[0],
  );
  if (!solReserve || !usdcReserve) {
    throw new Error(
      "Kamino main market missing SOL or USDC reserve — cannot read leverage rates.",
    );
  }
  const slot = await rpc.getSlot().send();
  const solSupplyApy = Number(
    solReserve.totalSupplyAPY(
      slot as unknown as Parameters<typeof solReserve.totalSupplyAPY>[0],
    ),
  );
  const usdcBorrowApy = Number(
    usdcReserve.totalBorrowAPY(
      slot as unknown as Parameters<typeof usdcReserve.totalBorrowAPY>[0],
    ),
  );
  return {
    apy: usdcBorrowApy,
    apyBreakdown: {
      solSupply: solSupplyApy,
      usdcBorrow: usdcBorrowApy,
    },
    fetchedAt: Date.now(),
  };
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
  const rpc = getSolanaRpc();

  // Scope refresh is required for borrowing — without it the lending
  // tx fails ObligationStale on simulation. The Scope client is
  // constructed once here and reused for both the deposit and borrow
  // SDK calls; each call decides for itself which scope ixs to inject.
  const scope = new Scope(
    "mainnet-beta",
    rpc as unknown as ConstructorParameters<typeof Scope>[1],
  );
  const scopeConfigurations = await scope.getAllConfigurations();
  const scopeRefreshConfig = { scope, scopeConfigurations };

  const owner = createNoopSigner(address(params.walletPublicKey));
  const obligation = new VanillaObligation(PROGRAM_ID);

  // Two separate SDK calls instead of buildDepositAndBorrowTxns. The
  // single combined call produces a tx that exceeds the 1232-byte
  // ceiling even after splitting init ixs out (~1500-1700 bytes).
  // Splitting deposit and borrow gives up cross-tx atomicity, which is
  // acceptable: if borrow fails the collateral is already deposited
  // and the user (or a future composite leverage-loop node) can retry
  // borrow alone without any further deposits.
  type DepositArgs = Parameters<typeof KaminoAction.buildDepositTxns>;
  const depositAction = await KaminoAction.buildDepositTxns(
    market as unknown as DepositArgs[0],
    collateralLamports.toString(),
    address(SOL_MINT_ADDRESS) as unknown as DepositArgs[2],
    owner as unknown as DepositArgs[3],
    obligation as unknown as DepositArgs[4],
    true, // useV2Ixs
    scopeRefreshConfig as unknown as DepositArgs[6],
  );

  type BorrowArgs = Parameters<typeof KaminoAction.buildBorrowTxns>;
  const borrowAction = await KaminoAction.buildBorrowTxns(
    market as unknown as BorrowArgs[0],
    borrowRaw.toString(),
    address(USDC_MINT_ADDRESS) as unknown as BorrowArgs[2],
    owner as unknown as BorrowArgs[3],
    obligation as unknown as BorrowArgs[4],
    true, // useV2Ixs
    scopeRefreshConfig as unknown as BorrowArgs[6],
  );

  const deposit = actionToOrderedIxs(depositAction);
  const borrow = actionToOrderedIxs(borrowAction);

  // Deposit's init ixs (createUserLut, initUserMetadata, initObligation,
  // initObligationForFarm) go into a standalone init tx so the deposit
  // tx itself stays small. Borrow's setup ixs assume the obligation
  // already exists, so it doesn't have init ixs to extract.
  const initKitIxs: KitInstruction[] = [];
  const depositMainKitIxs: KitInstruction[] = [];
  for (let i = 0; i < deposit.ixs.length; i++) {
    if (isInitIx(deposit.labels[i] ?? "")) {
      initKitIxs.push(deposit.ixs[i]);
    } else {
      depositMainKitIxs.push(deposit.ixs[i]);
    }
  }
  const borrowMainKitIxs: KitInstruction[] = borrow.ixs;

  const connection = getSolanaWeb3Connection();
  const fromPubkey = new PublicKey(params.walletPublicKey);
  // Single blockhash for all txs is fine — they're submitted in
  // sequence with `confirmed` between them (~0.5-1s each), well inside
  // the ~60s blockhash validity window.
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
      // Surface which sub-tx blew the 1232-byte ceiling rather than the
      // bare web3.js "encoding overruns Uint8Array". Helpful when a
      // future SDK update or a more complex obligation pushes us over.
      throw new Error(
        `kamino-borrow ${label}: serialize failed (${web3Ixs.length} ixs) — ${err instanceof Error ? err.message : String(err)}`,
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
    buildVersionedTx(depositMainKitIxs.map(kitIxToWeb3Ix), "deposit"),
  );
  transactionsBase64.push(
    buildVersionedTx(borrowMainKitIxs.map(kitIxToWeb3Ix), "borrow"),
  );

  // Output amount is the borrowed USDC in raw base units (6 decimals).
  // That is what flows downstream as the entry-node "input" for any
  // wired-up consumer (e.g., a Jupiter swap that converts borrowed USDC
  // back into SOL for re-collateralization in a leverage loop).
  return {
    transactionsBase64,
    expectedOutputAmount: borrowRaw,
    fees: {
      networkLamports: 5000n,
    },
    warnings: [
      "Borrowing requires healthy collateral. Kamino may reject or partially fill the tx if the requested borrow exceeds the LTV ceiling.",
      "Deposit and borrow run as separate transactions; if the borrow tx fails, your collateral is already supplied and you can retry borrow without re-depositing.",
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
