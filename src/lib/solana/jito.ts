import "server-only";

import { address } from "@solana/kit";

import type { NodeCatalogItem } from "@/mock-data/workspace/types";

import { getSolanaRpc } from "./connection";
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

export const JITOSOL_MINT_ADDRESS =
  "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn";

const CATALOG_ITEM: NodeCatalogItem = {
  id: "jito-sol-stake",
  title: "Stake with Jito",
  description:
    "Stake SOL and receive JitoSOL (liquid staking with MEV tips, ~5.9% APY).",
  group: "strategy",
  nodeKind: "strategy",
  supportedInputAssets: ["SOL"],
  primaryOutputAsset: "JitoSOL",
  protocolLabel: "Jito",
  keywords: ["stake", "lst", "liquid staking", "mev", "jito"],
};

const WIDGETS: WidgetSchema[] = [
  {
    key: "amount",
    kind: "number",
    label: "Amount to stake (SOL)",
    min: 0,
    required: true,
  },
];

const PROTOCOL: ProtocolMetadata = {
  id: "jito",
  name: "Jito",
  auditCount: 3,
  tvlUsd: 2_900_000_000,
  ageMonths: 36,
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
  const mint = address(JITOSOL_MINT_ADDRESS);

  const response = await rpc
    .getTokenAccountsByOwner(owner, { mint }, { encoding: "jsonParsed" })
    .send();

  const accounts = response.value;
  if (accounts.length === 0) {
    return null;
  }

  let totalRaw = BigInt(0);
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
    asset: "JitoSOL",
    rawAmount: totalRaw,
    displayAmount: `${formatTokenAmount(totalRaw, decimals, 4)} JitoSOL`,
    lastUpdatedAt: Date.now(),
  };
}

async function readRate(): Promise<APYQuote> {
  // Stub: ships Phase 1 only as a placeholder. Real APY is derived from
  // the Jito stake pool account state (exchange rate delta over recent
  // epochs) or fetched from the Jito public yield endpoint. Replace
  // before P2 write paths land.
  return {
    apy: 0.059,
    apyBreakdown: { base: 0.052, mev: 0.007 },
    fetchedAt: Date.now(),
  };
}

async function buildTransaction(
  params: BuildTransactionParams,
): Promise<BuildTransactionResult> {
  throw new Error(
    `JitoSOL buildTransaction is not implemented yet (called for wallet ${params.walletPublicKey}) — lands in the P2 write path after the Privy Solana signing smoke test passes.`,
  );
}

function formatTokenAmount(
  raw: bigint,
  decimals: number,
  precision: number,
): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = raw / divisor;
  const remainder = raw % divisor;
  const remainderStr = remainder.toString().padStart(decimals, "0");
  const decimalPart = remainderStr.slice(0, precision);
  return `${whole.toString()}.${decimalPart}`;
}

export const jitoStakeAdapter: ProtocolAdapter = {
  catalogItemId: CATALOG_ITEM.id,
  catalogItem: CATALOG_ITEM,
  widgets: WIDGETS,
  protocol: PROTOCOL,
  readPosition,
  readRate,
  buildTransaction,
};
