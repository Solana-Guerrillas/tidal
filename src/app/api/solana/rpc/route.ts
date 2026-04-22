import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const url = process.env.HELIUS_RPC_URL;
  if (!url) {
    return NextResponse.json(
      { error: "HELIUS_RPC_URL is not set on the server" },
      { status: 500 },
    );
  }

  const body = await request.text();

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "RPC proxy failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
