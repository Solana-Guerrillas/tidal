import type { WalletSummary } from "@/mock-data/shell/types";

type WalletSummaryProps = {
  wallet: WalletSummary;
};

export function WalletSummary({ wallet }: WalletSummaryProps) {
  return (
    <div className="hidden h-8 items-center rounded-lg border border-tidal-border bg-tidal-card/70 px-3 md:flex">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-tidal-accent">
          {wallet.addressLabel}
        </p>
      </div>
      <div className="mx-3 h-4 w-px bg-tidal-border" />
      <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
        <span>{wallet.solBalanceLabel}</span>
        <span className="tidal-shell-chip-muted">|</span>
        <span>{wallet.usdBalanceLabel}</span>
      </div>
    </div>
  );
}
