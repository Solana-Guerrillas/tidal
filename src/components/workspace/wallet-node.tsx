"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ArrowsClockwise } from "@phosphor-icons/react";

import { Badge } from "@/components/tidal/badge";
import { SurfaceCard } from "@/components/tidal/surface-card";
import { useWorkspaceBuilderContext } from "@/components/workspace/workspace-builder-context";
import { useWalletBalances } from "@/hooks/workspace/use-wallet-balances";
import { formatWorkspaceNodeStatusLabel } from "@/lib/workspace/status";
import type {
  WalletAssetBalance,
  WalletNodeType,
} from "@/mock-data/workspace/types";

export const WalletNode = memo(
  ({ data, isConnectable }: NodeProps<WalletNodeType>) => {
    const builderContext = useWorkspaceBuilderContext();
    const isEditable = builderContext?.isEditable ?? false;
    const { state: balanceState, refetch } = useWalletBalances();

    // Build a list of assets for display. When Privy has provisioned a
    // wallet, overlay real on-chain balances onto the mocked asset
    // metadata (preserving outputId / compatibleNodeTypes so the canvas
    // wiring stays intact). Otherwise fall back to the seeded mock so
    // the demo looks alive even before login.
    const displayAssets = mergeAssetsWithRealBalances(data.assets, balanceState);
    const headerLabel = renderHeaderLabel(balanceState, data.holdingsLabel);

    return (
      <SurfaceCard className="w-[280px] bg-[#15202E]" padding="none">
        <div className="border-b border-tidal-border px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tidal-text-eyebrow">{data.title}</span>
            <div className="flex items-center gap-2">
              <Badge variant="status">{formatWorkspaceNodeStatusLabel(data.status)}</Badge>
              {balanceState.kind !== "no-wallet" ? (
                <button
                  type="button"
                  aria-label="Refresh balances"
                  title="Refresh balances"
                  onClick={(event) => {
                    event.stopPropagation();
                    void refetch();
                  }}
                  className="nodrag flex h-5 w-5 items-center justify-center rounded-md text-tidal-muted transition-colors hover:bg-tidal-sidebar-active hover:text-tidal-accent"
                >
                  <ArrowsClockwise
                    weight="bold"
                    className={`h-3 w-3 ${balanceState.kind === "loading" ? "animate-spin" : ""}`}
                  />
                </button>
              ) : null}
            </div>
          </div>
          <p className="tidal-text-caption text-tidal-muted">{data.description}</p>
        </div>

        <div className="divide-y divide-tidal-border/70">
          {displayAssets.map((asset) => (
            <div key={asset.symbol} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-1">
                <Badge variant="token" size="xs">
                  {asset.symbol}
                </Badge>
                <div className="tidal-text-caption text-foreground">
                  {asset.amountLabel}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="tidal-text-caption text-tidal-muted">
                  {asset.valueLabel}
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={asset.outputId}
                  isConnectable={isConnectable}
                  aria-label={`${asset.symbol} output`}
                  className="!static h-4! w-4! shrink-0 cursor-crosshair rounded-full! border-2! border-tidal-accent! bg-tidal-card! transition-transform hover:scale-110"
                />
              </div>
            </div>
          ))}
        </div>

        {isEditable ? (
          <div className="border-t border-tidal-border px-4 py-3 tidal-text-caption text-tidal-muted">
            Drag from an asset circle to add the next node.
          </div>
        ) : null}

        {headerLabel ? (
          <div className="border-t border-tidal-border px-4 py-3 tidal-text-caption text-foreground">
            {headerLabel}
          </div>
        ) : null}
      </SurfaceCard>
    );
  }
);

WalletNode.displayName = "WalletNode";

function mergeAssetsWithRealBalances(
  mockAssets: WalletAssetBalance[],
  balanceState: ReturnType<typeof useWalletBalances>["state"],
): WalletAssetBalance[] {
  if (balanceState.kind !== "ready") return mockAssets;

  const { sol, usdc } = balanceState.balances;
  return mockAssets.map((asset) => {
    if (asset.symbol === "SOL") {
      return {
        ...asset,
        amountLabel: sol.displayAmount,
        // No reliable USD price feed wired up yet; show shortened wallet
        // address as a more honest secondary label than a stale dollar
        // figure. Keeps the slot non-empty so layout doesn't shift.
        valueLabel: shortAddress(balanceState.balances.address),
      };
    }
    if (asset.symbol === "USDC") {
      return {
        ...asset,
        amountLabel: usdc.displayAmount,
        valueLabel: "1:1 USD",
      };
    }
    return asset;
  });
}

function renderHeaderLabel(
  balanceState: ReturnType<typeof useWalletBalances>["state"],
  fallback?: string,
): string | undefined {
  switch (balanceState.kind) {
    case "no-wallet":
      return fallback ?? "Login to see live balances";
    case "loading":
      return "Loading on-chain balances…";
    case "error":
      return `Balance fetch failed: ${balanceState.message}`;
    case "ready":
      return `Live balances · ${shortAddress(balanceState.balances.address)}`;
  }
}

function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
