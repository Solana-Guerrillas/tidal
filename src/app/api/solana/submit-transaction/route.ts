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

    // Poll for confirmation so downstream work (e.g., the next node in a
    // multi-step graph) sees the resulting on-chain state. Without this,
    // a swap + supply pipeline would race - the supply's balance check
    // would run against pre-swap state.
    const deadline = Date.now() + 30_000;
    let confirmedError: unknown = null;
    while (Date.now() < deadline) {
      const status = await connection.getSignatureStatus(signature);
      const value = status.value;
      if (value?.err) {
        confirmedError = value.err;
        break;
      }
      const cs = value?.confirmationStatus;
      if (cs === "confirmed" || cs === "finalized") {
        return NextResponse.json({ signature, confirmationStatus: cs });
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (confirmedError !== null) {
      return NextResponse.json(
        {
          error: "transaction failed on-chain",
          detail: JSON.stringify(confirmedError),
          signature,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        error: "confirmation timeout (30s)",
        signature,
      },
      { status: 504 },
    );
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
