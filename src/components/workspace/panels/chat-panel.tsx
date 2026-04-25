"use client";

import { useEffect, useRef, useState } from "react";
import { ChatCircle, Plus } from "@phosphor-icons/react";
import { useChat } from "@ai-sdk/react";

import { ChatMessage } from "@/components/tidal/chat-message";
import { PromptComposer } from "@/components/tidal/prompt-composer";
import { PanelShell } from "@/components/workspace/panels/panel-shell";
import { StrategyComposeMessage } from "@/components/workspace/strategy-compose-message";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/providers/workspace-provider";
import type { WorkspaceThread } from "@/mock-data/workspace/types";
import type { ComposeStrategyOutput } from "@/lib/ai/tools/compose-strategy";

type ChatPanelProps = {
  activeThread: WorkspaceThread;
  threads: WorkspaceThread[];
  onSelectThread: (threadId: string) => void;
  onClose: () => void;
};

type ToolPart = {
  type: string;
  state?: string;
  output?: unknown;
  errorText?: string;
  toolCallId?: string;
};

export function ChatPanel({
  activeThread,
  threads,
  onSelectThread,
  onClose,
}: ChatPanelProps) {
  const { createBlankThread, applyGraphMutations } = useWorkspace();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [composerValue, setComposerValue] = useState("");
  const { messages, sendMessage, status } = useChat();
  const appliedToolCallIds = useRef<Set<string>>(new Set());

  // Apply composed-strategy mutations to the active workspace exactly once
  // per tool call. Side-effecting in render is wrong; an effect tied to
  // messages catches every output-available transition without re-applying
  // on subsequent renders.
  useEffect(() => {
    for (const message of messages) {
      for (const part of message.parts as ToolPart[]) {
        if (
          part.type !== "tool-composeStrategy" ||
          part.state !== "output-available" ||
          !part.toolCallId ||
          appliedToolCallIds.current.has(part.toolCallId)
        ) {
          continue;
        }
        const output = part.output as ComposeStrategyOutput | undefined;
        if (!output) continue;
        applyGraphMutations(output.mutations);
        appliedToolCallIds.current.add(part.toolCallId);
      }
    }
  }, [messages, applyGraphMutations]);

  const isBusy = status === "submitted" || status === "streaming";

  const orderedMessages = [...messages].reverse();

  return (
    <PanelShell
      eyebrow="Chat"
      title={activeThread.title}
      description={activeThread.preview}
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            aria-label={isHistoryOpen ? "Hide chat history" : "Show chat history"}
            onClick={() => setIsHistoryOpen((current) => !current)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-tidal-muted transition-colors hover:bg-tidal-sidebar-active hover:text-tidal-accent",
              isHistoryOpen && "bg-tidal-sidebar-active text-tidal-accent"
            )}
          >
            <ChatCircle weight="bold" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="New chat"
            onClick={() => {
              createBlankThread();
              setIsHistoryOpen(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-tidal-muted transition-colors hover:bg-tidal-sidebar-active hover:text-tidal-accent"
          >
            <Plus weight="bold" className="h-4 w-4" />
          </button>
        </>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        {isHistoryOpen ? (
          <div className="mb-4 space-y-1 rounded-lg border border-tidal-border bg-background/20 p-2">
            {threads.map((thread) => {
              const isActive = thread.id === activeThread.id;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => {
                    onSelectThread(thread.id);
                    setIsHistoryOpen(false);
                  }}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors",
                    isActive
                      ? "bg-tidal-sidebar-active text-tidal-accent"
                      : "text-foreground hover:bg-tidal-sidebar-active/60"
                  )}
                >
                  <span className="text-sm font-medium">{thread.title}</span>
                  <span className="text-[11px] text-tidal-muted">
                    {thread.lastViewedLabel}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col-reverse gap-4 overflow-y-auto pr-1">
          {orderedMessages.map((message) => (
            <div key={message.id} className="flex flex-col gap-2">
              {message.parts.map((part, partIndex) => {
                if (part.type === "text") {
                  return (
                    <ChatMessage
                      key={partIndex}
                      role={message.role === "user" ? "user" : "ai"}
                    >
                      {part.text}
                    </ChatMessage>
                  );
                }
                if (part.type === "tool-composeStrategy") {
                  const toolPart = part as ToolPart;
                  if (toolPart.state === "output-available" && toolPart.output) {
                    return (
                      <StrategyComposeMessage
                        key={partIndex}
                        output={toolPart.output as ComposeStrategyOutput}
                      />
                    );
                  }
                  if (toolPart.state === "output-error") {
                    return (
                      <ChatMessage key={partIndex} role="ai">
                        Strategy compose failed:{" "}
                        {toolPart.errorText ?? "unknown error"}
                      </ChatMessage>
                    );
                  }
                  return (
                    <ChatMessage key={partIndex} role="ai">
                      Composing strategy…
                    </ChatMessage>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 shrink-0">
          <PromptComposer
            className="w-full"
            value={composerValue}
            onValueChange={setComposerValue}
            placeholder={
              isBusy ? "Tidal is thinking…" : "Ask Tidal to compose a strategy"
            }
            onSubmit={({ value }) => {
              sendMessage({ text: value });
              setComposerValue("");
            }}
          />
        </div>
      </div>
    </PanelShell>
  );
}
