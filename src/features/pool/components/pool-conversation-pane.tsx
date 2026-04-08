import { ChatMessage } from "@/components/tidal/chat-message";
import { PromptComposer } from "@/components/tidal/prompt-composer";
import { SectionLabel } from "@/components/tidal/section-label";
import type { PoolThread } from "@/mock-data/pool/types";

type PoolConversationPaneProps = {
  poolSummary: string;
  activeThread: PoolThread;
};

export function PoolConversationPane({
  poolSummary,
  activeThread,
}: PoolConversationPaneProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col px-4 py-5 md:px-6">
      <div className="mb-6 max-w-4xl space-y-2">
        <p className="tidal-text-thread-title">{activeThread.title}</p>
        <p className="max-w-3xl tidal-text-message">
          {poolSummary}
        </p>
      </div>

      <div className="tidal-context-panel mb-6">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div>
            <SectionLabel>Active thread context</SectionLabel>
            <p className="mt-2 tidal-text-body">
              {activeThread.context?.title ?? "Pool-wide strategy"}
            </p>
          </div>
          <span className="tidal-meta-pill hidden md:inline-flex">
            {activeThread.lastViewedLabel}
          </span>
        </div>
        <p className="tidal-text-message">
          {activeThread.context?.description ?? activeThread.preview}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-6 flex flex-1 flex-col gap-4">
          {activeThread.messages.map((message) => (
            <ChatMessage key={message.id} role={message.role}>
              {message.content}
            </ChatMessage>
          ))}
        </div>

        <div className="mb-6">
          <PromptComposer
            className="w-full"
            defaultMode="Pool"
          />
        </div>
      </div>
    </section>
  );
}
