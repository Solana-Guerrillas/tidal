import { NextResponse } from "next/server";

import { registerAllAdapters } from "@/lib/solana/adapters";
import { listAdapters } from "@/lib/solana/registry";

export const runtime = "nodejs";

/**
 * GET /api/solana/positions/all?wallet=<pubkey>
 *
 * Walks every registered ProtocolAdapter, calls readPosition + readRate
 * in parallel, and returns the combined result. Lets the investment
 * tracker make a single round-trip instead of one fetch per adapter.
 *
 * Adapters that return null position (no on-chain state for this wallet)
 * are filtered out of the response — only positions the user actually
 * holds appear in the list.
 */
export async function GET(request: Request): Promise<NextResponse> {
  registerAllAdapters();

  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json(
      { error: "missing ?wallet=<pubkey>" },
      { status: 400 },
    );
  }

  const adapters = listAdapters();

  const results = await Promise.all(
    adapters.map(async (adapter) => {
      try {
        const [position, rate] = await Promise.all([
          adapter.readPosition({ walletPublicKey: wallet }),
          adapter.readRate(),
        ]);
        return {
          catalogItemId: adapter.catalogItemId,
          catalogItem: adapter.catalogItem,
          protocol: adapter.protocol,
          position: position
            ? {
                ...position,
                rawAmount: position.rawAmount.toString(),
                accruedYield: position.accruedYield
                  ? {
                      ...position.accruedYield,
                      rawAmount: position.accruedYield.rawAmount.toString(),
                    }
                  : undefined,
                debt: position.debt
                  ? {
                      ...position.debt,
                      rawAmount: position.debt.rawAmount.toString(),
                    }
                  : undefined,
              }
            : null,
          rate,
          error: null as string | null,
        };
      } catch (err) {
        return {
          catalogItemId: adapter.catalogItemId,
          catalogItem: adapter.catalogItem,
          protocol: adapter.protocol,
          position: null,
          rate: null,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  return NextResponse.json({
    wallet,
    fetchedAt: Date.now(),
    // Only include adapters that returned a non-null position so the
    // tracker doesn't render rows for empty / non-applicable adapters.
    // Errored adapters DO show up so the panel can surface the issue
    // rather than silently dropping them.
    positions: results.filter((r) => r.position !== null || r.error !== null),
  });
}
