"use client";

import Link from "next/link";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PreferenceContextPanel } from "@/components/tidal/preference-context-panel";
import { usePreferenceProfile } from "@/features/shell/providers/preference-profile-provider";
import { WalletSummary } from "@/features/shell/components/wallet-summary";
import type { SidebarNavigation } from "@/mock-data/shell/types";

type AppHeaderProps = {
  navigation: SidebarNavigation;
};

export function AppHeader({ navigation }: AppHeaderProps) {
  const { profile, toggleInterestOption, toggleRiskOption } = usePreferenceProfile();

  return (
    <header className="border-b border-tidal-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="tidal-sidebar-brand text-base">
            Tidal
          </Link>
          <SidebarTrigger className="text-tidal-muted hover:text-tidal-accent" />
        </div>

        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="h-8 border-tidal-border bg-tidal-card/70 text-tidal-accent hover:bg-tidal-sidebar-active"
                  size="sm"
                />
              }
            >
              Risk and investment types
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="pr-10">
                <DialogTitle>Risk and investment types</DialogTitle>
                <DialogDescription>
                  These are your global Tidal preferences. They shape how chat,
                  Pool, and Amplify suggestions are framed across the prototype.
                </DialogDescription>
              </DialogHeader>

              <PreferenceContextPanel
                title="Global preference profile"
                description="Update your standing risk appetite and investment interests here. This applies across all chat and workspace surfaces."
                riskOptions={profile.riskOptions}
                interestOptions={profile.interestOptions}
                onRiskToggle={toggleRiskOption}
                onInterestToggle={toggleInterestOption}
              />
            </DialogContent>
          </Dialog>

          <WalletSummary wallet={navigation.wallet} />
        </div>
      </div>
    </header>
  );
}
