import "server-only";

import { address } from "@solana/kit";
import { depositSol } from "@solana/spl-stake-pool";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import { getAdapterCatalogEntry } from "./adapter-catalog";
import { getSolanaRpc, getSolanaWeb3Connection } from "./connection";
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

export const BSOL_MINT_ADDRESS =
  "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1";

export const BLAZE_STAKE_POOL_ADDRESS =
  "stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi";

const ENTRY = getAdapterCatalogEntry("blaze-sol-stake")!;
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

type ParsedTokenAccountInfo = {
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number | null;
  };
};

async function readPosition(
  params: ReadPositionParams,
): Promise<PositionSnapshot | null> {
  const rpc = getSolanaRpc();
  const owner = address(params.walletPublicKey);
  const mint = address(BSOL_MINT_ADDRESS);

  const response = await rpc
    .getTokenAccountsByOwner(owner, { mint }, { encoding: "jsonParsed" })
    .send();

  const accounts = response.value;
  if (accounts.length === 0) return null;

  let totalRaw = 0n;
  let decimals = 9;
  for (const entry of accounts) {
    const parsed = entry.account.data as {
      parsed: { info: ParsedTokenAccountInfo };
    };
    const info = parsed.parsed.info;
    totalRaw += BigInt(info.tokenAmount.amount);
    decimals = info.tokenAmount.decimals;
  }

  return {
    asset: "bSOL",
    rawAmount: totalRaw,
    displayAmount: `${formatTokenAmount(totalRaw, decimals, 4)} bSOL`,
    lastUpdatedAt: Date.now(),
  };
}

async function readRate(): Promise<APYQuote> {
  // Stub matching the Jito readRate placeholder. BlazeStake's public APY
  // hovers ~6.5% (pure stake yield, no MEV bonus). Real number derives
  // from the stake pool's exchange-rate delta across recent epochs.
  return {
    apy: 0.065,
    fetchedAt: Date.now(),
  };
}

async function buildTransaction(
  params: BuildTransactionParams,
): Promise<BuildTransactionResult> {
  const lamports = params.inputAmount;
  if (lamports <= 0n) {
    throw new Error(
      `BlazeStake stake requires a positive lamport amount (got ${lamports.toString()})`,
    );
  }
  // depositSol takes a JS number for lamports. Guard before conversion.
  if (lamports > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(
      `stake amount exceeds JS number safe range: ${lamports.toString()} lamports`,
    );
  }

  const connection = getSolanaWeb3Connection();
  const fromPubkey = new PublicKey(params.walletPublicKey);
  const stakePool = new PublicKey(BLAZE_STAKE_POOL_ADDRESS);

  const { instructions, signers } = await depositSol(
    connection,
    stakePool,
    fromPubkey,
    Number(lamports),
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

  const warnings: string[] = [];
  const minStakeLamports = 10_000_000n; // 0.01 SOL conservative floor
  if (lamports < minStakeLamports) {
    warnings.push(
      `staking ${lamports.toString()} lamports (< 0.01 SOL) - small-stake economics may not be worthwhile after fees`,
    );
  }

  return {
    transactionsBase64: [transactionBase64],
    // Pool exchange rate >= 1.0 (bSOL appreciates vs SOL). Returning input
    // lamports as a lower bound — actual bSOL minted is slightly less
    // after the pool's deposit fee and the exchange-rate denominator.
    expectedOutputAmount: lamports,
    fees: {
      networkLamports: 5000n,
    },
    warnings,
  };
}

function formatTokenAmount(
  raw: bigint,
  decimals: number,
  precision: number,
): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const remainder = raw % divisor;
  const remainderStr = remainder.toString().padStart(decimals, "0");
  const decimalPart = remainderStr.slice(0, precision);
  return `${whole.toString()}.${decimalPart}`;
}

export const blazeStakeAdapter: ProtocolAdapter = {
  catalogItemId: CATALOG_ITEM.id,
  catalogItem: CATALOG_ITEM,
  widgets: WIDGETS,
  protocol: PROTOCOL,
  readPosition,
  readRate,
  buildTransaction,
};
