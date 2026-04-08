import { PromptComposer } from "@/components/tidal/prompt-composer";
import { SectionLabel } from "@/components/tidal/section-label";
import { SuggestionAction } from "@/components/tidal/suggestion-action";
import type { PoolThread } from "@/mock-data/pool/types";

type PoolOverviewPaneProps = {
  poolName: string;
  overviewPrompt: string;
  recentThreads: PoolThread[];
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
};

export function PoolOverviewPane({
  poolName,
  overviewPrompt,
  recentThreads,
  onThreadSelect,
  onNewChat,
}: PoolOverviewPaneProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col px-4 py-5 md:px-6">
      <div className="mb-6 max-w-5xl space-y-4">
        <h2 className="tidal-text-thread-title">{poolName}</h2>
        <p className="max-w-4xl tidal-text-message">{overviewPrompt}</p>
      </div>

      <div className="max-w-5xl flex-1 space-y-4">
        <div className="space-y-3">
          <h3 className="tidal-text-thread-title">
            Start a new chat
          </h3>
          <PromptComposer
            className="w-full"
            defaultMode="Pool"
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
