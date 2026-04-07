"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { poolWorkspace } from "@/mock-data/pool/mocks/workspace";
import type {
  PoolInterestOption,
  PoolPanelTab,
  PendingPoolAction,
  PoolRiskOption,
  PoolThread,
  PoolThreadContext,
  PoolWorkspace,
} from "@/mock-data/pool/types";

type PoolThreadSeed = {
  title: string;
  preview: string;
  context: PoolThreadContext;
  initialUserMessage: string;
};

type PoolWorkspaceContextValue = {
  workspace: PoolWorkspace;
  isOverviewActive: boolean;
  activePanelTab: PoolPanelTab;
  panelFeedback: string | null;
  activeThread: PoolThread;
  recentThreads: PoolThread[];
  showOverview: () => void;
  setActivePanelTab: (tab: PoolPanelTab) => void;
  toggleRiskOption: (label: string) => void;
  toggleInterestOption: (label: string) => void;
  queuePendingAction: (action: PendingPoolAction) => void;
  setActiveThreadId: (threadId: string) => void;
  createBlankThread: () => void;
  createFocusedThread: (seed: PoolThreadSeed) => void;
};

const PoolWorkspaceContext = createContext<PoolWorkspaceContextValue | null>(null);

function cloneThread(thread: PoolThread): PoolThread {
  return {
    ...thread,
    messages: thread.messages.map((message) => ({ ...message })),
    context: thread.context ? { ...thread.context } : undefined,
  };
}

export function PoolWorkspaceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [threads, setThreads] = useState<PoolThread[]>(() =>
    poolWorkspace.threads.map(cloneThread)
  );
  const [riskOptions, setRiskOptions] = useState<PoolRiskOption[]>(() =>
    poolWorkspace.riskOptions.map((option) => ({ ...option }))
  );
  const [interestOptions, setInterestOptions] = useState<PoolInterestOption[]>(() =>
    poolWorkspace.interestOptions.map((option) => ({ ...option }))
  );
  const [pendingActions, setPendingActions] = useState<PendingPoolAction[]>(() =>
    poolWorkspace.pendingActions.map((action) => ({ ...action }))
  );
  const [activeThreadId, setActiveThreadIdState] = useState(
    poolWorkspace.activeThreadId
  );
  const [activePanelTab, setActivePanelTab] = useState<PoolPanelTab>(
    poolWorkspace.defaultPanelTab
  );
  const [panelFeedback, setPanelFeedback] = useState<string | null>(null);
  const [isOverviewActive, setIsOverviewActive] = useState(true);

  const showOverview = useCallback(() => {
    setIsOverviewActive(true);
  }, []);

  const setActiveThreadId = useCallback((threadId: string) => {
    setActiveThreadIdState(threadId);
    setIsOverviewActive(false);
  }, []);

  const toggleRiskOption = useCallback((label: string) => {
    setRiskOptions((currentOptions) =>
      currentOptions.map((option) =>
        option.label === label
          ? { ...option, checked: true }
          : { ...option, checked: false }
      )
    );
  }, []);

  const toggleInterestOption = useCallback((label: string) => {
    setInterestOptions((currentOptions) =>
      currentOptions.map((option) =>
        option.label === label
          ? { ...option, checked: !option.checked }
          : option
      )
    );
  }, []);

  const queuePendingAction = useCallback((action: PendingPoolAction) => {
    setPendingActions((currentActions) => {
      const existingAction = currentActions.find(
        (currentAction) =>
          currentAction.sourceType === action.sourceType &&
          currentAction.sourceId === action.sourceId
      );

      if (existingAction) {
        setPanelFeedback(`Pending action already queued: ${existingAction.title}`);
        return currentActions;
      }

      setPanelFeedback(`Pending action added: ${action.title}`);
      return [action, ...currentActions];
    });
  }, []);

  const createBlankThread = useCallback(() => {
    const nextIndex = threads.length + 1;
    const nextThread: PoolThread = {
      id: `pool-thread-${nextIndex}`,
      title: `New chat ${nextIndex}`,
      preview: "A fresh Pool chat for researching a new idea or testing a strategy change.",
      lastViewedLabel: "Created just now",
      context: {
        type: "pool",
        entityId: poolWorkspace.id,
        title: "Pool-wide strategy",
        description: "A blank thread for broader portfolio research or a new idea.",
      },
      messages: [
        {
          id: `pool-thread-${nextIndex}-ai-1`,
          role: "ai",
          content:
            "New Pool thread ready. We can review a protocol, compare positions, or test a fresh allocation idea here.",
        },
      ],
    };

    setThreads((currentThreads) => [...currentThreads, nextThread]);
    setActiveThreadIdState(nextThread.id);
    setIsOverviewActive(false);
  }, [threads.length]);

  const createFocusedThread = useCallback((seed: PoolThreadSeed) => {
    const existingThread = threads.find(
      (thread) =>
        thread.context?.type === seed.context.type &&
        thread.context.entityId === seed.context.entityId
    );

    if (existingThread) {
      setActiveThreadIdState(existingThread.id);
      setIsOverviewActive(false);
      return;
    }

    const nextIndex = threads.length + 1;
    const nextThread: PoolThread = {
      id: `pool-thread-${nextIndex}`,
      title: seed.title,
      preview: seed.preview,
      lastViewedLabel: "Created just now",
      context: seed.context,
      messages: [
        {
          id: `pool-thread-${nextIndex}-ai-1`,
          role: "ai",
          content:
            "Focused research thread created. I can use this context to compare risk, yield, and fit within the wider Pool.",
        },
        {
          id: `pool-thread-${nextIndex}-user-1`,
          role: "user",
          content: seed.initialUserMessage,
        },
      ],
    };

    setThreads((currentThreads) => [...currentThreads, nextThread]);
    setActiveThreadIdState(nextThread.id);
    setIsOverviewActive(false);
  }, [threads]);

  const workspace = useMemo<PoolWorkspace>(
    () => ({
      ...poolWorkspace,
      threads,
      riskOptions,
      interestOptions,
      pendingActions,
      activeThreadId,
    }),
    [threads, riskOptions, interestOptions, pendingActions, activeThreadId]
  );

  const activeThread =
    threads.find((thread) => thread.id === activeThreadId) ?? threads[0];

  const recentThreads = threads.filter((thread) => thread.id !== activeThread.id);

  const value = useMemo(
    () => ({
      workspace,
      isOverviewActive,
      activePanelTab,
      panelFeedback,
      activeThread,
      recentThreads,
      showOverview,
      setActivePanelTab,
      toggleRiskOption,
      toggleInterestOption,
      queuePendingAction,
      setActiveThreadId,
      createBlankThread,
      createFocusedThread,
    }),
    [
      workspace,
      isOverviewActive,
      activePanelTab,
      panelFeedback,
      activeThread,
      recentThreads,
      showOverview,
      setActivePanelTab,
      toggleRiskOption,
      toggleInterestOption,
      queuePendingAction,
      setActiveThreadId,
      createBlankThread,
      createFocusedThread,
    ]
  );

  return (
    <PoolWorkspaceContext.Provider value={value}>
      {children}
    </PoolWorkspaceContext.Provider>
  );
}

export function usePoolWorkspace() {
  const context = useContext(PoolWorkspaceContext);

  if (!context) {
    throw new Error("usePoolWorkspace must be used within PoolWorkspaceProvider.");
  }

  return context;
}
