import { PromptComposer } from "@/components/tidal/prompt-composer";
import { SectionLabel } from "@/components/tidal/section-label";
import { SuggestionAction } from "@/components/tidal/suggestion-action";
import { WorkspaceButton } from "@/components/tidal/workspace-button";
import { homeScreenContent } from "@/mock-data/home/mocks/home-screen";

export function HomeScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-[39px] px-[43px] py-5">
      <div className="absolute right-6 top-6">
        <WorkspaceButton>Create investment workspace</WorkspaceButton>
      </div>

      <h1 className="text-center text-[42px]/[52px] font-medium text-tidal-accent">
        How can I help today?
      </h1>

      <PromptComposer />

      <div className="flex w-[30%] flex-col gap-3">
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
  );
}
