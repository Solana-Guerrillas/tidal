import { cn } from "@/lib/utils";
import type { PoolThread } from "@/mock-data/pool/types";

type PoolWorkspaceHeaderProps = {
  className?: string;
  poolName: string;
  threads: PoolThread[];
  isOverviewActive: boolean;
  activeThreadId: string;
  onShowOverview: () => void;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
};

export function PoolWorkspaceHeader({
  className,
  poolName,
  threads,
  isOverviewActive,
  activeThreadId,
  onShowOverview,
  onThreadSelect,
  onNewChat,
}: PoolWorkspaceHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 border-b border-tidal-border px-4 py-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:px-6",
        className
      )}
    >
      <div className="flex flex-col gap-3 md:min-w-0">
        <h1 className="tidal-text-workspace-title">{poolName}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-center">
        <button
          type="button"
          onClick={onShowOverview}
          className={cn(
            "tidal-tab-button",
            isOverviewActive
              ? "tidal-tab-button-active"
              : "tidal-tab-button-inactive"
          )}
        >
          Overview
        </button>
        {threads.map((thread) => {
          const isActive = !isOverviewActive && thread.id === activeThreadId;

          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => onThreadSelect(thread.id)}
              className={cn(
                "tidal-tab-button",
                isActive
                  ? "tidal-tab-button-active"
                  : "tidal-tab-button-inactive"
              )}
            >
              {thread.title}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNewChat}
        className="tidal-action-button tidal-action-button-primary w-fit px-3 py-1.5 md:ml-auto"
      >
        New chat
      </button>
    </header>
  );
}
