import "server-only";

import { createSolanaRpc } from "@solana/kit";

type SolanaRpc = ReturnType<typeof createSolanaRpc>;

let cachedRpc: SolanaRpc | null = null;

export function getSolanaRpc(): SolanaRpc {
  if (cachedRpc) return cachedRpc;

  const url = process.env.HELIUS_RPC_URL;
  if (!url) {
    throw new Error(
      "HELIUS_RPC_URL is not set. Add it to .env.local (server-only, no NEXT_PUBLIC_ prefix).",
    );
  }

  cachedRpc = createSolanaRpc(url);
  return cachedRpc;
}

export function resetSolanaRpcForTesting(): void {
  cachedRpc = null;
}
