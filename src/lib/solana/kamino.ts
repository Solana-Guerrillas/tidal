import "server-only";

import { KaminoMarket, PROGRAM_ID } from "@kamino-finance/klend-sdk";
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

export const USDC_MINT_ADDRESS =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Kamino main market (primary USDC/SOL lending market on Solana mainnet).
export const KAMINO_MAIN_MARKET_ADDRESS =
  "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF";

// Typical Solana mainnet slot time is ~400-450ms. Kamino uses this to
// annualize accrued interest for APR/APY calculations.
const RECENT_SLOT_DURATION_MS = 450;

const CATALOG_ITEM: NodeCatalogItem = {
  id: "kamino-usdc-supply",
  title: "Lend USDC on Kamino",
  description:
    "Supply USDC to the Kamino main market lending pool and earn variable supply APY.",
  group: "strategy",
  nodeKind: "strategy",
  supportedInputAssets: ["USDC"],
  primaryOutputAsset: "kUSDC",
  protocolLabel: "Kamino",
  keywords: ["lend", "supply", "stablecoin", "kamino", "yield"],
};

const WIDGETS: WidgetSchema[] = [
  {
    key: "amount",
    kind: "number",
    label: "Amount to supply (USDC)",
    min: 0,
    required: true,
  },
];

const PROTOCOL: ProtocolMetadata = {
  id: "kamino",
  name: "Kamino",
  auditCount: 3,
  tvlUsd: 3_000_000_000,
  ageMonths: 30,
  riskTier: "shallows",
};

async function loadMainMarket(): Promise<KaminoMarket> {
  const rpc = getSolanaRpc();
  // Kamino's klend-sdk bundles @solana/kit v2; our app uses v6 via Privy's
  // peer dep. Runtime RPC shape is compatible (JSON-RPC is JSON-RPC) but
  // the branded types diverge. The casts here pin types at the SDK boundary.
  const market = await KaminoMarket.load(
    rpc as unknown as Parameters<typeof KaminoMarket.load>[0],
    address(KAMINO_MAIN_MARKET_ADDRESS) as unknown as Parameters<
      typeof KaminoMarket.load
    >[1],
    RECENT_SLOT_DURATION_MS,
    PROGRAM_ID,
    true,
  );
  if (!market) {
    throw new Error(
      `Kamino main market not found at ${KAMINO_MAIN_MARKET_ADDRESS}`,
    );
  }
  return market;
}

async function readPosition(
  params: ReadPositionParams,
): Promise<PositionSnapshot | null> {
  // Obligation reading is deferred until the write path lands. Users
  // that have not deposited into Kamino do not have an obligation
  // account, and returning null for them is the correct shape. Real
  // obligation reads for existing depositors arrive in the follow-up
  // commit alongside buildTransaction.
  void params;
  return null;
}

async function readRate(): Promise<APYQuote> {
  const rpc = getSolanaRpc();
  const market = await loadMainMarket();
  const reserve = market.getReserveByMint(
    address(USDC_MINT_ADDRESS) as unknown as Parameters<
      typeof market.getReserveByMint
    >[0],
  );
  if (!reserve) {
    throw new Error(
      `Kamino main market has no USDC reserve (expected mint ${USDC_MINT_ADDRESS})`,
    );
  }
  const slot = await rpc.getSlot().send();
  const apy = Number(
    reserve.totalSupplyAPY(
      slot as unknown as Parameters<typeof reserve.totalSupplyAPY>[0],
    ),
  );
  return {
    apy,
    fetchedAt: Date.now(),
  };
}

async function buildTransaction(
  params: BuildTransactionParams,
): Promise<BuildTransactionResult> {
  throw new Error(
    `Kamino USDC supply buildTransaction is not implemented yet (called for wallet ${params.walletPublicKey}) — lands in the follow-up commit that adds obligation handling and KaminoAction.buildDepositTxns wiring.`,
  );
}

export const kaminoUsdcSupplyAdapter: ProtocolAdapter = {
  catalogItemId: CATALOG_ITEM.id,
  catalogItem: CATALOG_ITEM,
  widgets: WIDGETS,
  protocol: PROTOCOL,
  readPosition,
  readRate,
  buildTransaction,
};
