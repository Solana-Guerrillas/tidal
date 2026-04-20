import { NextResponse } from "next/server";

import { registerAllAdapters } from "@/lib/solana/adapters";
import { getAdapter } from "@/lib/solana/registry";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<NextResponse> {
  registerAllAdapters();

  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet");
  const catalogItemId = url.searchParams.get("catalogItemId");

  if (!wallet) {
    return NextResponse.json(
      { error: "missing ?wallet=<pubkey>" },
      { status: 400 },
    );
  }
  if (!catalogItemId) {
    return NextResponse.json(
      { error: "missing ?catalogItemId=<id>" },
      { status: 400 },
    );
  }

  const adapter = getAdapter(catalogItemId);
  if (!adapter) {
    return NextResponse.json(
      { error: `no adapter registered for "${catalogItemId}"` },
      { status: 404 },
    );
  }

  try {
    const [position, rate] = await Promise.all([
      adapter.readPosition({ walletPublicKey: wallet }),
      adapter.readRate(),
    ]);
    return NextResponse.json({
      catalogItemId,
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
          }
        : null,
      rate,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "adapter read failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
