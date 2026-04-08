"use client";

import { ChatMessage } from "@/components/tidal/chat-message";
import { CreateWorkspaceRecommendationCard } from "@/components/tidal/create-workspace-action-card";
import { PromptComposer } from "@/components/tidal/prompt-composer";
import { SectionLabel } from "@/components/tidal/section-label";
import { SuggestionAction } from "@/components/tidal/suggestion-action";
import { useGlobalChatWorkspace } from "@/features/home/providers/global-chat-workspace-provider";
import { homeScreenContent } from "@/mock-data/home/mocks/home-screen";

export function HomeScreen() {
  const {
    activeChat,
    completeWorkspaceActionCard,
    mentionTargets,
    submitMessage,
  } = useGlobalChatWorkspace();
  const isEmptyChat = activeChat.messages.length === 0;
  const orderedMessages = [...activeChat.messages].reverse();

  if (isEmptyChat) {
    return (
      <div className="tidal-page tidal-page-center">
        <div className="tidal-content-column tidal-content-column-wide tidal-stack-gap">
          <div className="space-y-3 text-center">
            <SectionLabel>Global chat</SectionLabel>
            <h1 className="tidal-text-display">What can I help you explore?</h1>
            <p className="mx-auto max-w-2xl tidal-text-message">
              Start broad, ask about Solana opportunities, or describe the Pool
              or Amplify strategy you want to build.
            </p>
          </div>

          <PromptComposer
            className="tidal-content-column tidal-content-column-wide"
            mentionTargets={mentionTargets}
            showMentions
            onSubmit={submitMessage}
          />

          <div className="space-y-3">
            <SectionLabel>Suggestions</SectionLabel>
            <div className="flex flex-col gap-2">
              {homeScreenContent.suggestions.map((suggestion) => (
                <SuggestionAction key={suggestion} variant="row">
                  {suggestion}
                </SuggestionAction>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="tidal-page min-h-full">
      <div className="mx-auto flex min-h-full w-full max-w-5xl min-w-0 flex-1 flex-col">
        <div className="mb-6 flex flex-col gap-3">
          <SectionLabel>Global chat</SectionLabel>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="tidal-text-thread-title">{activeChat.title}</h1>
              <p className="max-w-3xl tidal-text-message">{activeChat.preview}</p>
            </div>
            <span className="tidal-meta-pill w-fit">{activeChat.lastViewedLabel}</span>
          </div>
          {activeChat.links.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeChat.links.map((link) => (
                <span key={link.id} className="tidal-meta-pill">
                  {link.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col justify-end gap-4 overflow-y-auto pb-8">
          {orderedMessages.map((message) => {
            const { actionCard } = message;

            return (
              <div key={message.id} className="space-y-3">
                {message.content ? (
                  <ChatMessage role={message.role}>{message.content}</ChatMessage>
                ) : null}

                {actionCard ? (
                  <CreateWorkspaceRecommendationCard
                    actionCard={actionCard}
                    onPrimaryAction={() =>
                      completeWorkspaceActionCard(activeChat.id, actionCard.id)
                    }
                  />
                ) : null}
              </div>
            );
          })}
          </div>

          <div className="sticky bottom-0 z-10 mt-auto border-t border-tidal-border bg-gradient-to-t from-background via-background/95 to-background/80 pt-4 pb-2 backdrop-blur-sm">
            <div>
              <PromptComposer
                className="w-full"
                mentionTargets={mentionTargets}
                showMentions
                onSubmit={submitMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
