"use client";

import { ChatMessage } from "@/components/tidal/chat-message";
import { PromptComposer } from "@/components/tidal/prompt-composer";
import { SectionLabel } from "@/components/tidal/section-label";
import { SuggestionAction } from "@/components/tidal/suggestion-action";
import type { AmplifyChatMessage } from "@/mock-data/amplify/types";
import type { AppMode } from "@/mock-data/shell/types";

type AmplifyChatProps = {
  messages: AmplifyChatMessage[];
  suggestions: string[];
  mode?: AppMode;
  defaultMode?: AppMode;
  inputValue?: string;
  onInputValueChange?: (value: string) => void;
  onSubmit?: () => void;
};

export function AmplifyChat({
  messages,
  suggestions,
  mode,
  defaultMode = "Amplify",
  inputValue,
  onInputValueChange,
  onSubmit,
}: AmplifyChatProps) {
  const aiMessages = messages.filter((message) => message.role === "ai");
  const userMessages = messages.filter((message) => message.role === "user");

  return (
    <div className="flex h-full flex-col">
      <div className="tidal-panel-padding flex min-h-0 flex-1 flex-col justify-end gap-7 pb-5">
        <div className="flex flex-col gap-2">
          {aiMessages.map((message, index) => (
            <ChatMessage key={`${message.role}-${index}`} role="ai">
              {message.content}
            </ChatMessage>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Suggestions</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            {suggestions.map((suggestion) => (
              <SuggestionAction key={suggestion}>{suggestion}</SuggestionAction>
            ))}
          </div>
        </div>

        {userMessages.map((message, index) => (
          <ChatMessage key={`${message.role}-${index}`} role="user">
            {message.content}
          </ChatMessage>
        ))}

      </div>

      <div className="tidal-panel-padding flex shrink-0 flex-col items-center gap-3 pt-5">
        <PromptComposer
          className="w-full"
          mode={mode}
          defaultMode={defaultMode}
          value={inputValue}
          onValueChange={onInputValueChange}
          onSubmit={onSubmit}
          surface="pill"
        />

        <span className="tidal-note">
          Tidal will ask for approval before executing any transactions
        </span>
      </div>
    </div>
  );
}
