"use client";

import { ArrowsClockwise } from "@phosphor-icons/react";

import { Badge } from "@/components/tidal/badge";
import { SurfaceCard } from "@/components/tidal/surface-card";
import { PanelShell } from "@/components/workspace/panels/panel-shell";
import {
  useAllPositions,
  type LivePositionEntry,
} from "@/hooks/workspace/use-all-positions";

type InvestmentsPanelProps = {
  workspaceId: string;
  onClose: () => void;
};

export function InvestmentsPanel({ workspaceId, onClose }: InvestmentsPanelProps) {
  void workspaceId; // positions are per-wallet, not per-workspace today
  const { state, refetch } = useAllPositions();

  return (
    <PanelShell
      eyebrow="Investments"
      title="Your active positions"
      description="Live positions across registered protocol adapters for the connected wallet."
      onClose={onClose}
      actions={
        state.kind !== "no-wallet" ? (
          <button
            type="button"
            aria-label="Refresh positions"
            title="Refresh positions"
            onClick={() => void refetch()}
            className="flex h-8 w-8 items-center justify-center rounded-md text-tidal-muted transition-colors hover:bg-tidal-sidebar-active hover:text-tidal-accent"
          >
            <ArrowsClockwise
              weight="bold"
              className={`h-4 w-4 ${state.kind === "loading" ? "animate-spin" : ""}`}
            />
          </button>
        ) : null
      }
    >
      <PanelBody state={state} />
    </PanelShell>
  );
}

function PanelBody({
  state,
}: {
  state: ReturnType<typeof useAllPositions>["state"];
}) {
  if (state.kind === "no-wallet") {
    return (
      <SurfaceCard tone="muted">
        <p className="tidal-text-message">
          Login with Privy to see live positions across Jito, Kamino, and any
          other protocols you have on-chain state with.
        </p>
      </SurfaceCard>
    );
  }

  if (state.kind === "loading") {
    return (
      <SurfaceCard tone="muted">
        <p className="tidal-text-message">Loading positions…</p>
      </SurfaceCard>
    );
  }

  if (state.kind === "error") {
    return (
      <SurfaceCard tone="muted">
        <p className="tidal-text-message text-red-400">
          Couldn&apos;t load positions: {state.message}
        </p>
      </SurfaceCard>
    );
  }

  // state.kind === "ready"
  if (state.positions.length === 0) {
    return (
      <SurfaceCard tone="muted">
        <p className="tidal-text-message">
          No active positions yet. Build a strategy on the canvas or ask the AI
          to compose one in chat to see it listed here.
        </p>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-3">
      {state.positions.map((entry) => (
        <PositionCard key={entry.catalogItemId} entry={entry} />
      ))}
    </div>
  );
}

function PositionCard({ entry }: { entry: LivePositionEntry }) {
  const { catalogItem, protocol, position, rate, error } = entry;

  if (error) {
    return (
      <SurfaceCard className="border-amber-500/40 bg-amber-500/5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="tidal-text-eyebrow">{catalogItem.title}</span>
          <Badge variant="status">{protocol.riskTier}</Badge>
        </div>
        <p className="tidal-text-caption text-amber-300">
          Position read failed: {error}
        </p>
      </SurfaceCard>
    );
  }

  if (!position) return null;

  const apyDisplay =
    rate?.apy !== undefined ? `${(rate.apy * 100).toFixed(2)}%` : null;

  // Project annual yield in USD if we know both position USD value and APY.
  // Pure math; presentational only.
  const projectedAnnualUsd =
    position.valueUsd !== undefined && rate?.apy !== undefined
      ? position.valueUsd * rate.apy
      : null;

  return (
    <SurfaceCard>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="tidal-text-eyebrow">{catalogItem.title}</span>
          <span className="tidal-text-caption text-tidal-muted">
            {protocol.name}
          </span>
        </div>
        <Badge variant="status">{protocol.riskTier}</Badge>
      </div>

      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="tidal-text-body text-foreground">
          {position.displayAmount}
        </span>
        {position.valueUsd !== undefined ? (
          <span className="tidal-text-caption text-tidal-muted">
            ≈ ${position.valueUsd.toFixed(2)}
          </span>
        ) : null}
      </div>

      {position.debt ? (
        <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="tidal-text-caption text-amber-300">
              Debt: {position.debt.displayAmount}
            </span>
            {position.debt.valueUsd !== undefined ? (
              <span className="tidal-text-caption text-tidal-muted">
                ≈ ${position.debt.valueUsd.toFixed(2)}
              </span>
            ) : null}
          </div>
          {position.healthFactor !== undefined ? (
            <div className="tidal-text-caption text-tidal-muted">
              Health factor: {position.healthFactor.toFixed(2)}
              {position.healthFactor < 1.2 ? (
                <span className="ml-1 text-red-400">⚠ near liquidation</span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {apyDisplay ? (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-tidal-border/60 pt-2">
          <span className="tidal-text-caption text-emerald-400">
            {apyDisplay} APY · live
          </span>
          {projectedAnnualUsd !== null ? (
            <span className="tidal-text-caption text-tidal-muted">
              ≈ ${projectedAnnualUsd.toFixed(2)}/yr
            </span>
          ) : null}
        </div>
      ) : null}
    </SurfaceCard>
  );
}
