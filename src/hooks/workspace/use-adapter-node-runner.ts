"use client";

import { useCallback } from "react";
import {
  useSignTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";

import type {
  NodeRunInput,
  NodeRunner,
  NodeRunResult,
} from "@/lib/workspace/graph-exec";

type BuildTransactionResponse = {
  transactionBase64?: string;
  expectedOutputAmount?: string;
  fees?: { networkLamports?: string; priorityLamports?: string };
  warnings?: string[];
  error?: string;
  detail?: string;
};

type SubmitResponse = {
  signature?: string;
  error?: string;
  detail?: string;
};

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let out = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(out);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Returns a NodeRunner bound to the user's first connected Privy Solana
 * wallet. Each invocation builds the transaction server-side (via the
 * catalogItemId -> ProtocolAdapter registry), signs client-side via
 * Privy's useSignTransaction, and submits server-side through our
 * Helius-backed /api/solana/submit-transaction route.
 *
 * The returned function is suitable for passing into executeGraph from
 * src/lib/workspace/graph-exec.ts. It is also used directly by the
 * /privy-smoke page for single-node tests - the same flow, one node
 * at a time.
 */
export function useAdapterNodeRunner(): NodeRunner {
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();

  return useCallback(
    async ({ node, inputAmount }: NodeRunInput): Promise<NodeRunResult> => {
      const wallet = wallets[0];
      if (!wallet) {
        throw new Error("No Solana wallet connected.");
      }

      const buildResp = await fetch("/api/solana/build-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalogItemId: node.catalogItemId,
          walletPublicKey: wallet.address,
          inputAmount: inputAmount.toString(),
          widgets: node.widgets,
        }),
      });
      const buildData = (await buildResp.json()) as BuildTransactionResponse;
      if (!buildResp.ok) {
        throw new Error(
          buildData.detail ||
            buildData.error ||
            `build HTTP ${buildResp.status.toString()}`,
        );
      }
      if (!buildData.transactionBase64) {
        throw new Error("build response missing transactionBase64");
      }

      const signed = await signTransaction({
        transaction: base64ToUint8Array(buildData.transactionBase64),
        wallet,
      });
      const signedBase64 = uint8ArrayToBase64(signed.signedTransaction);

      const submitResp = await fetch("/api/solana/submit-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionBase64: signedBase64 }),
      });
      const submitData = (await submitResp.json()) as SubmitResponse;
      if (!submitResp.ok || !submitData.signature) {
        throw new Error(
          submitData.detail ||
            submitData.error ||
            `submit HTTP ${submitResp.status.toString()}`,
        );
      }

      const outputAmount = buildData.expectedOutputAmount
        ? BigInt(buildData.expectedOutputAmount)
        : 0n;

      return {
        txSignature: submitData.signature,
        outputAmount,
      };
    },
    [wallets, signTransaction],
  );
}
