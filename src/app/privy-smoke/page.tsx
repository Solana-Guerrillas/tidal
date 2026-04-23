"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useSignMessage,
  useSignTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";

const JITO_CATALOG_ITEM_ID = "jito-sol-stake";
const STAKE_LAMPORTS = "10000000"; // 0.01 SOL

const KAMINO_CATALOG_ITEM_ID = "kamino-usdc-supply";
const SUPPLY_USDC_RAW = "1000000"; // 1 USDC (6 decimals)

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

type TxRunResult = { signature: string; warnings: string[] };

type AdapterRunState = {
  txSig: string | null;
  warnings: string[];
  error: string | null;
  busy: boolean;
};

function initialRunState(): AdapterRunState {
  return { txSig: null, warnings: [], error: null, busy: false };
}

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

export default function PrivySmokePage() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const { signTransaction } = useSignTransaction();

  const [signature, setSignature] = useState<string | null>(null);
  const [signError, setSignError] = useState<string | null>(null);

  const [stakeState, setStakeState] = useState<AdapterRunState>(
    initialRunState,
  );
  const [supplyState, setSupplyState] = useState<AdapterRunState>(
    initialRunState,
  );

  const handleSign = async () => {
    setSignError(null);
    setSignature(null);
    const wallet = wallets[0];
    if (!wallet) {
      setSignError("No Solana wallet connected.");
      return;
    }
    try {
      const result = await signMessage({
        message: new TextEncoder().encode("tidal-smoke-test"),
        wallet,
      });
      const hex = Array.from(result.signature)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setSignature(hex);
    } catch (err) {
      setSignError(err instanceof Error ? err.message : String(err));
    }
  };

  const runAdapterTx = async (
    catalogItemId: string,
    inputAmount: string,
  ): Promise<TxRunResult> => {
    const wallet = wallets[0];
    if (!wallet) {
      throw new Error("No Solana wallet connected.");
    }

    const buildResp = await fetch("/api/solana/build-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catalogItemId,
        walletPublicKey: wallet.address,
        inputAmount,
      }),
    });
    const buildData = (await buildResp.json()) as BuildTransactionResponse;
    if (!buildResp.ok) {
      throw new Error(
        buildData.detail || buildData.error || `HTTP ${buildResp.status}`,
      );
    }
    if (!buildData.transactionBase64) {
      throw new Error("response missing transactionBase64");
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
          `submit returned ${submitResp.status}`,
      );
    }

    return {
      signature: submitData.signature,
      warnings: buildData.warnings ?? [],
    };
  };

  const run = async (
    setState: typeof setStakeState,
    catalogItemId: string,
    inputAmount: string,
  ) => {
    setState({ txSig: null, warnings: [], error: null, busy: true });
    try {
      const result = await runAdapterTx(catalogItemId, inputAmount);
      setState({
        txSig: result.signature,
        warnings: result.warnings,
        error: null,
        busy: false,
      });
    } catch (err) {
      setState({
        txSig: null,
        warnings: [],
        error: err instanceof Error ? err.message : String(err),
        busy: false,
      });
    }
  };

  if (!ready) {
    return <div className="p-8 font-mono text-sm">Loading Privy…</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-8 font-mono text-sm">
      <header className="flex items-baseline gap-4">
        <h1 className="text-xl">Privy Solana smoke test</h1>
        <span className="text-muted-foreground">
          (debug page — not linked from app nav)
        </span>
      </header>

      <section className="flex flex-col gap-2">
        <div>
          <span className="opacity-60">authenticated:</span>{" "}
          <strong>{String(authenticated)}</strong>
        </div>
        {user && (
          <div>
            <span className="opacity-60">user id:</span> {user.id}
          </div>
        )}
        <div className="flex gap-2">
          {!authenticated ? (
            <button
              className="rounded border border-white/30 px-3 py-1 hover:bg-white/5"
              onClick={() => login()}
            >
              Login
            </button>
          ) : (
            <button
              className="rounded border border-white/30 px-3 py-1 hover:bg-white/5"
              onClick={() => logout()}
            >
              Logout
            </button>
          )}
        </div>
      </section>

      {authenticated && (
        <section className="flex flex-col gap-2">
          <h2 className="opacity-60">Solana wallets</h2>
          {wallets.length === 0 ? (
            <div className="opacity-60">No Solana wallets linked.</div>
          ) : (
            <ul className="flex flex-col gap-1">
              {wallets.map((w) => (
                <li key={w.address} className="flex gap-2">
                  <span className="opacity-60">
                    {w.standardWallet?.name ?? "wallet"}:
                  </span>
                  <span>{w.address}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {authenticated && wallets.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="opacity-60">Sign message test</h2>
          <button
            className="w-fit rounded border border-white/30 px-3 py-1 hover:bg-white/5"
            onClick={handleSign}
          >
            Sign &quot;tidal-smoke-test&quot; with first Solana wallet
          </button>
          {signature && (
            <div className="break-all text-emerald-400">
              signature (hex): {signature}
            </div>
          )}
          {signError && <div className="text-red-400">error: {signError}</div>}
        </section>
      )}

      {authenticated && wallets.length > 0 && (
        <AdapterRunSection
          title="Stake 0.01 SOL → JitoSOL via Jito stake pool (MAINNET)"
          buttonLabel="Stake 0.01 SOL with Jito"
          busyLabel="Staking…"
          state={stakeState}
          onRun={() => run(setStakeState, JITO_CATALOG_ITEM_ID, STAKE_LAMPORTS)}
        />
      )}

      {authenticated && wallets.length > 0 && (
        <AdapterRunSection
          title="Supply 1 USDC → Kamino main market (MAINNET)"
          buttonLabel="Supply 1 USDC to Kamino"
          busyLabel="Supplying…"
          state={supplyState}
          onRun={() =>
            run(setSupplyState, KAMINO_CATALOG_ITEM_ID, SUPPLY_USDC_RAW)
          }
        />
      )}
    </div>
  );
}

function AdapterRunSection({
  title,
  buttonLabel,
  busyLabel,
  state,
  onRun,
}: {
  title: string;
  buttonLabel: string;
  busyLabel: string;
  state: AdapterRunState;
  onRun: () => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="opacity-60">{title}</h2>
      <button
        disabled={state.busy}
        className="w-fit rounded border border-white/30 px-3 py-1 hover:bg-white/5 disabled:opacity-50"
        onClick={onRun}
      >
        {state.busy ? busyLabel : buttonLabel}
      </button>
      {state.warnings.length > 0 && (
        <ul className="flex flex-col gap-1 text-amber-400">
          {state.warnings.map((w, i) => (
            <li key={i}>warning: {w}</li>
          ))}
        </ul>
      )}
      {state.txSig && (
        <div className="flex flex-col gap-1 text-emerald-400">
          <div className="break-all">tx signature: {state.txSig}</div>
          <a
            className="underline hover:text-emerald-300"
            href={`https://solscan.io/tx/${state.txSig}`}
            target="_blank"
            rel="noreferrer"
          >
            view on solscan ↗
          </a>
        </div>
      )}
      {state.error && <div className="text-red-400">error: {state.error}</div>}
    </section>
  );
}
