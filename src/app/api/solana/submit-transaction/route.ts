import { NextResponse } from "next/server";

import { getSolanaWeb3Connection } from "@/lib/solana/connection";

export const runtime = "nodejs";

type SubmitRequestBody = {
  transactionBase64?: unknown;
  skipPreflight?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
  let body: SubmitRequestBody;
  try {
    body = (await request.json()) as SubmitRequestBody;
  } catch {
    return NextResponse.json(
      { error: "request body must be valid JSON" },
      { status: 400 },
    );
  }

  const { transactionBase64, skipPreflight } = body;

  if (typeof transactionBase64 !== "string" || transactionBase64.length === 0) {
    return NextResponse.json(
      { error: "transactionBase64 (string) is required" },
      { status: 400 },
    );
  }

  let txBytes: Uint8Array;
  try {
    txBytes = Uint8Array.from(Buffer.from(transactionBase64, "base64"));
  } catch {
    return NextResponse.json(
      { error: "transactionBase64 is not valid base64" },
      { status: 400 },
    );
  }

  try {
    const connection = getSolanaWeb3Connection();
    const signature = await connection.sendRawTransaction(txBytes, {
      skipPreflight: skipPreflight === true,
      maxRetries: 3,
    });
    return NextResponse.json({ signature });
  } catch (err) {
    return NextResponse.json(
      {
        error: "submit failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
