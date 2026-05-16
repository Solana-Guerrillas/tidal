import "server-only";

import { withdrawSol } from "@solana/spl-stake-pool";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import { getAdapterCatalogEntry } from "./adapter-catalog";
import { BLAZE_STAKE_POOL_ADDRESS } from "./blaze";
import { getSolanaWeb3Connection } from "./connection";
import type {
  APYQuote,
  BuildTransactionParams,
  BuildTransactionResult,
  PositionSnapshot,
  ProtocolAdapter,
  ProtocolMetadata,
  ReadPositionParams,
  WidgetSchema,
} from "./types";

const ENTRY = getAdapterCatalogEntry("blaze-sol-unstake")!;
const CATALOG_ITEM = ENTRY.catalogItem;
const WIDGETS: WidgetSchema[] = ENTRY.widgets;

const PROTOCOL: ProtocolMetadata = {
  id: "blaze",
  name: "BlazeStake",
  auditCount: 2,
  tvlUsd: 600_000_000,
  ageMonths: 30,
  riskTier: "shallows",
};

async function readPosition(
  params: ReadPositionParams,
): Promise<PositionSnapshot | null> {
  // Action-only adapter — the bSOL balance is surfaced by blaze-sol-stake's
  // readPosition. Returning null avoids double-counting in the panel.
  void params;
  return null;
}

async function readRate(): Promise<APYQuote | null> {
  // Unstaking has no yield. The stake adapter reports the live yield.
  return null;
}

async function buildTransaction(
  params: BuildTransactionParams,
): Promise<BuildTransactionResult> {
  const bSolBaseUnits = params.inputAmount;
  if (bSolBaseUnits <= 0n) {
    throw new Error(
      `BlazeStake unstake requires a positive bSOL amount (got ${bSolBaseUnits.toString()})`,
    );
  }
  // Same SDK quirk as Jito unstake: depositSol takes lamports, withdrawSol
  // takes a decimal number (internally multiplies by 1e9). Convert here so
  // a 0.003 bSOL request (3_000_000 raw) doesn't read as "3M bSOL".
  if (bSolBaseUnits > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(
      `unstake amount exceeds JS number safe range: ${bSolBaseUnits.toString()} bSOL base units`,
    );
  }
  const bSolDecimal = Number(bSolBaseUnits) / 1_000_000_000;

  const connection = getSolanaWeb3Connection();
  const fromPubkey = new PublicKey(params.walletPublicKey);
  const stakePool = new PublicKey(BLAZE_STAKE_POOL_ADDRESS);

  const { instructions, signers } = await withdrawSol(
    connection,
    stakePool,
    fromPubkey, // tokenOwner - holds the bSOL being burned
    fromPubkey, // solReceiver - gets SOL back
    bSolDecimal,
  );

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const message = new TransactionMessage({
    payerKey: fromPubkey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  const tx = new VersionedTransaction(message);
  if (signers.length > 0) {
    tx.sign(signers);
  }

  const transactionBase64 = Buffer.from(tx.serialize()).toString("base64");

  return {
    transactionsBase64: [transactionBase64],
    expectedOutputAmount: bSolBaseUnits,
    fees: {
      networkLamports: 5000n,
    },
    warnings: [
      "Instant withdrawal via the stake pool reserve incurs a small fee (~0.04%). Larger unstakes may be limited by available reserve liquidity.",
    ],
  };
}

export const blazeSolUnstakeAdapter: ProtocolAdapter = {
  catalogItemId: CATALOG_ITEM.id,
  catalogItem: CATALOG_ITEM,
  widgets: WIDGETS,
  protocol: PROTOCOL,
  readPosition,
  readRate,
  buildTransaction,
};
