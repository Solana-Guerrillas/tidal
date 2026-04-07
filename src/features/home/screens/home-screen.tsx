import { PromptComposer } from "@/components/tidal/prompt-composer";
import { SectionLabel } from "@/components/tidal/section-label";
import { SuggestionAction } from "@/components/tidal/suggestion-action";
import { WorkspaceButton } from "@/components/tidal/workspace-button";
import { homeScreenContent } from "@/mock-data/home/mocks/home-screen";

export function HomeScreen() {
  return (
    <div className="tidal-page tidal-page-center">
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <WorkspaceButton>Create investment workspace</WorkspaceButton>
      </div>

      <h1 className="tidal-text-display">
        How can I help today?
      </h1>

      <PromptComposer className="tidal-content-column tidal-content-column-wide" />

      <div className="tidal-content-column tidal-stack-gap">
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
