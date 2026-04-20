"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignMessage,
} from "@privy-io/react-auth/solana";

export default function PrivySmokePage() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    setError(null);
    setSignature(null);
    const wallet = wallets[0];
    if (!wallet) {
      setError("No Solana wallet connected.");
      return;
    }
    try {
      const result = await signMessage({
        message: new TextEncoder().encode("tidal-smoke-test"),
        wallet,
      });
      const bytes = result.signature;
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setSignature(hex);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (!ready) {
    return (
      <div className="p-8 font-mono text-sm">Loading Privy…</div>
    );
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
          <h2 className="opacity-60">Sign test</h2>
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
          {error && <div className="text-red-400">error: {error}</div>}
        </section>
      )}
    </div>
  );
}
