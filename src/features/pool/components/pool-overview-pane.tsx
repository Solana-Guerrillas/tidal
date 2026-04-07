import { PromptComposer } from "@/components/tidal/prompt-composer";
import { SectionLabel } from "@/components/tidal/section-label";
import { SuggestionAction } from "@/components/tidal/suggestion-action";
import { cn } from "@/lib/utils";
import type {
  PoolInterestOption,
  PoolRiskOption,
  PoolThread,
} from "@/mock-data/pool/types";

type PoolOverviewPaneProps = {
  poolName: string;
  overviewPrompt: string;
  riskOptions: PoolRiskOption[];
  interestOptions: PoolInterestOption[];
  recentThreads: PoolThread[];
  onRiskToggle: (label: string) => void;
  onInterestToggle: (label: string) => void;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
};

function PoolOptionPill({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex cursor-pointer items-center gap-3 rounded-full border px-4 py-2 transition-colors",
        checked
          ? "border-tidal-accent bg-tidal-card text-tidal-accent hover:bg-tidal-sidebar-active/70"
          : "border-tidal-border bg-tidal-card text-tidal-muted hover:border-tidal-accent/30 hover:bg-tidal-sidebar-active/60 hover:text-tidal-accent"
      )}
    >
      <span
        className={cn(
          "h-4 w-4 rounded-full border",
          checked
            ? "border-tidal-accent bg-tidal-accent"
            : "border-tidal-muted/70 bg-transparent"
        )}
      />
      <span className="tidal-text-label font-medium">{label}</span>
    </div>
  );
}

export function PoolOverviewPane({
  poolName,
  overviewPrompt,
  riskOptions,
  interestOptions,
  recentThreads,
  onRiskToggle,
  onInterestToggle,
  onThreadSelect,
  onNewChat,
}: PoolOverviewPaneProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col px-4 py-5 md:px-6">
      <div className="mb-6 max-w-5xl space-y-4">
        <h2 className="tidal-text-thread-title">{poolName}</h2>
        <p className="max-w-4xl tidal-text-message">{overviewPrompt}</p>
      </div>

      <div className="mb-8 max-w-5xl space-y-6">
        <div>
          <SectionLabel className="mb-2.5 block">
            Your current risk tolerance:
          </SectionLabel>
          <div className="flex flex-wrap gap-3">
            {riskOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => onRiskToggle(option.label)}
                className="text-left"
                aria-pressed={option.checked}
              >
                <PoolOptionPill
                  checked={option.checked}
                  label={option.label}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel className="mb-2.5 block">
            Your current investment interests:
          </SectionLabel>
          <div className="flex flex-wrap gap-3">
            {interestOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => onInterestToggle(option.label)}
                className="text-left"
                aria-pressed={option.checked}
              >
                <PoolOptionPill
                  checked={option.checked}
                  label={option.label}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="tidal-text-label underline underline-offset-2 hover:text-tidal-accent"
          >
            Find out more about investment opportunities on Solana
          </button>
        </div>
      </div>

      <div className="max-w-5xl flex-1 space-y-4">
        <div className="space-y-3">
          <h3 className="tidal-text-thread-title">
            Start a new chat
          </h3>
          <PromptComposer
            className="w-full"
            defaultMode="Pool"
            showModeSelector={false}
            onSubmit={onNewChat}
          />
        </div>

        <div className="space-y-3">
          <SectionLabel>Recent chats</SectionLabel>
          <div className="flex flex-col gap-2">
            {recentThreads.map((thread) => (
              <SuggestionAction
                key={thread.id}
                variant="row"
                className="justify-start gap-4"
                onClick={() => onThreadSelect(thread.id)}
              >
                <span className="truncate">{thread.preview}</span>
              </SuggestionAction>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
