"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { amplifyInitialWorkspaces } from "@/mock-data/amplify/mocks/workspace";
import type {
  AmplifyGraphEdge,
  AmplifyGraphNode,
  AmplifyThread,
  AmplifyWorkspace,
  AmplifyWorkspaceKind,
} from "@/mock-data/amplify/types";

type PromoteGlobalChatToAmplifyThreadInput = {
  sourceChatId: string;
  sourceChatTitle: string;
  sourceChatPreview: string;
  latestUserMessage?: string;
  promotedFromLinkIds: string[];
  promotedLinkLabels: string[];
  targetWorkspaceId?: string;
};

type CreateAmplifyWorkspaceInput = {
  name?: string;
  summary?: string;
};

type AmplifyWorkspaceContextValue = {
  workspaces: AmplifyWorkspace[];
  workspace: AmplifyWorkspace;
  activeThread: AmplifyThread;
  recentThreads: AmplifyThread[];
  setActiveWorkspaceId: (workspaceId: string) => void;
  createWorkspace: (input?: CreateAmplifyWorkspaceInput) => AmplifyWorkspace;
  updateWorkspaceGraph: (
    workspaceId: string,
    nodes: AmplifyGraphNode[],
    edges: AmplifyGraphEdge[]
  ) => void;
  setActiveThreadId: (threadId: string, workspaceId?: string) => void;
  createBlankThread: (workspaceId?: string) => void;
  getPromotedThreadBySourceChatId: (chatId: string) => AmplifyThread | null;
  promoteGlobalChatToThread: (
    input: PromoteGlobalChatToAmplifyThreadInput
  ) => AmplifyThread;
};

const AmplifyWorkspaceContext =
  createContext<AmplifyWorkspaceContextValue | null>(null);

function cloneNode<TNode extends AmplifyGraphNode>(node: TNode): TNode {
  return {
    ...node,
    position: { ...node.position },
    data: { ...node.data },
  };
}

function cloneThread(thread: AmplifyThread): AmplifyThread {
  return {
    ...thread,
    messages: thread.messages.map((message) => ({ ...message })),
    source: thread.source ? { ...thread.source } : undefined,
  };
}

function cloneWorkspace(workspace: AmplifyWorkspace): AmplifyWorkspace {
  return {
    ...workspace,
    threads: workspace.threads.map(cloneThread),
    nodes: workspace.nodes.map((node) => cloneNode(node)),
    edges: workspace.edges.map((edge) => ({
      ...edge,
      style: edge.style ? { ...edge.style } : undefined,
      data: edge.data ? { ...edge.data } : undefined,
    })),
  };
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildPromotionSummary(input: PromoteGlobalChatToAmplifyThreadInput) {
  const linkedContext =
    input.promotedLinkLabels.length > 0
      ? input.promotedLinkLabels.join(", ")
      : "the current Amplify strategy context";
  const latestPrompt =
    input.latestUserMessage && input.latestUserMessage.trim().length > 0
      ? ` Latest user focus: "${input.latestUserMessage.trim()}".`
      : "";

  return `Promoted from the global chat "${input.sourceChatTitle}" so the conversation can continue as focused Amplify work around ${linkedContext}. ${input.sourceChatPreview}${latestPrompt}`;
}

function buildBlankWorkspace(
  input?: CreateAmplifyWorkspaceInput
): AmplifyWorkspace {
  const nextWorkspaceId = createId("amplify-workspace");
  const initialThreadId = createId("amplify-thread-builder");
  const walletNodeId = createId("wallet");

  return {
    id: nextWorkspaceId,
    name: input?.name?.trim() || "New Amplify Strategy",
    summary:
      input?.summary?.trim() ||
      "A blank builder workspace seeded with mocked wallet balances.",
    kind: "builder",
    isEditable: true,
    executionState: "draft",
    draftState: {
      updatedAtLabel: "Not run yet",
      changedNodeIds: [],
      impactedNodeIds: [],
    },
    activeThreadId: initialThreadId,
    threads: [
      {
        id: initialThreadId,
        title: "Builder thread",
        preview: "A fresh Amplify workspace for sketching a new reinvestment loop.",
        lastViewedLabel: "Created just now",
        messages: [
          {
            id: createId("amplify-thread-builder-ai"),
            role: "ai",
            content:
              "New Amplify workspace ready. Start from the wallet node and build out the loop you want to prototype.",
          },
        ],
      },
    ],
    suggestions: [
      "Start from SOL",
      "Split wallet balance",
      "Map a reinvestment loop",
    ],
    nodes: [
      {
        id: walletNodeId,
        type: "wallet",
        position: { x: 0, y: 180 },
        data: {
          nodeKind: "wallet",
          title: "Primary wallet",
          summary: "Mocked wallet balances ready to seed a new Amplify loop.",
          description:
            "Start with mocked wallet balances and branch into a new loop.",
          status: "ready",
          acceptedAssets: [],
          outputs: [
            {
              id: "sol",
              label: "SOL balance",
              asset: "SOL",
              kind: "primary",
              compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
              amountLabel: "126.40 SOL",
            },
            {
              id: "usdc",
              label: "USDC balance",
              asset: "USDC",
              kind: "primary",
              compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
              amountLabel: "42,000 USDC",
            },
          ],
          holdingsLabel: "$60,449 available",
          draftState: {
            hasChanges: false,
            changedFields: [],
          },
          assets: [
            {
              symbol: "SOL",
              amountLabel: "126.40 SOL",
              valueLabel: "$18,449",
              outputId: "sol",
              compatibleNodeTypes: [
                "amount",
                "strategy",
                "split",
                "destination",
              ],
            },
            {
              symbol: "USDC",
              amountLabel: "42,000 USDC",
              valueLabel: "$42,000",
              outputId: "usdc",
              compatibleNodeTypes: [
                "amount",
                "strategy",
                "split",
                "destination",
              ],
            },
          ],
        },
      },
    ],
    edges: [],
  };
}

function getWorkspaceById(
  workspaces: AmplifyWorkspace[],
  workspaceId?: string | null
) {
  if (!workspaceId) {
    return workspaces[0] ?? null;
  }

  return workspaces.find((workspace) => workspace.id === workspaceId) ?? workspaces[0] ?? null;
}

function getWorkspaceKindLabel(kind: AmplifyWorkspaceKind) {
  return kind === "example" ? "Example" : "Workspace";
}

export function AmplifyWorkspaceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [workspaces, setWorkspaces] = useState<AmplifyWorkspace[]>(() =>
    amplifyInitialWorkspaces.map(cloneWorkspace)
  );
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(
    amplifyInitialWorkspaces[0]?.id
  );

  const setActiveWorkspaceId = useCallback((workspaceId: string) => {
    setActiveWorkspaceIdState(workspaceId);
  }, []);

  const setActiveThreadId = useCallback(
    (threadId: string, workspaceId?: string) => {
      const targetWorkspaceId = workspaceId ?? activeWorkspaceId;

      if (!targetWorkspaceId) {
        return;
      }

      setWorkspaces((currentWorkspaces) =>
        currentWorkspaces.map((workspace) => {
          if (workspace.id !== targetWorkspaceId) {
            return workspace;
          }

          if (!workspace.threads.some((thread) => thread.id === threadId)) {
            return workspace;
          }

          return {
            ...workspace,
            activeThreadId: threadId,
          };
        })
      );
      setActiveWorkspaceIdState(targetWorkspaceId);
    },
    [activeWorkspaceId]
  );

  const createWorkspace = useCallback((input?: CreateAmplifyWorkspaceInput) => {
    const nextWorkspace = buildBlankWorkspace(input);

    setWorkspaces((currentWorkspaces) => [nextWorkspace, ...currentWorkspaces]);
    setActiveWorkspaceIdState(nextWorkspace.id);

    return nextWorkspace;
  }, []);

  const updateWorkspaceGraph = useCallback(
    (workspaceId: string, nodes: AmplifyGraphNode[], edges: AmplifyGraphEdge[]) => {
      setWorkspaces((currentWorkspaces) =>
        currentWorkspaces.map((workspace) =>
          workspace.id === workspaceId
            ? {
                ...workspace,
                nodes: nodes.map((node) => cloneNode(node)),
                edges: edges.map((edge) => ({
                  ...edge,
                  style: edge.style ? { ...edge.style } : undefined,
                  data: edge.data ? { ...edge.data } : undefined,
                })),
              }
            : workspace
        )
      );
    },
    []
  );

  const createBlankThread = useCallback(
    (workspaceId?: string) => {
      const targetWorkspaceId = workspaceId ?? activeWorkspaceId;

      if (!targetWorkspaceId) {
        return;
      }

      setWorkspaces((currentWorkspaces) =>
        currentWorkspaces.map((workspace) => {
          if (workspace.id !== targetWorkspaceId) {
            return workspace;
          }

          const nextIndex = workspace.threads.length + 1;
          const nextThread: AmplifyThread = {
            id: createId("amplify-thread"),
            title: `New thread ${nextIndex}`,
            preview: `A fresh Amplify thread for refining the ${getWorkspaceKindLabel(
              workspace.kind
            ).toLowerCase()} strategy graph.`,
            lastViewedLabel: "Created just now",
            messages: [
              {
                id: createId("amplify-thread-ai"),
                role: "ai",
                content:
                  "New Amplify thread ready. We can adjust the loop, compare protocol paths, or model the impact of a new node here.",
              },
            ],
          };

          return {
            ...workspace,
            activeThreadId: nextThread.id,
            threads: [...workspace.threads, nextThread],
          };
        })
      );

      setActiveWorkspaceIdState(targetWorkspaceId);
    },
    [activeWorkspaceId]
  );

  const getPromotedThreadBySourceChatId = useCallback(
    (chatId: string) =>
      workspaces
        .flatMap((workspace) => workspace.threads)
        .find((thread) => thread.source?.sourceChatId === chatId) ?? null,
    [workspaces]
  );

  const promoteGlobalChatToThread = useCallback(
    (input: PromoteGlobalChatToAmplifyThreadInput) => {
      const existingMatch = workspaces.find((workspace) =>
        workspace.threads.some(
          (thread) => thread.source?.sourceChatId === input.sourceChatId
        )
      );

      if (existingMatch) {
        const existingThread =
          existingMatch.threads.find(
            (thread) => thread.source?.sourceChatId === input.sourceChatId
          ) ?? existingMatch.threads[0];

        setActiveWorkspaceIdState(existingMatch.id);
        setWorkspaces((currentWorkspaces) =>
          currentWorkspaces.map((workspace) =>
            workspace.id === existingMatch.id
              ? { ...workspace, activeThreadId: existingThread.id }
              : workspace
          )
        );

        return existingThread;
      }

      const fallbackWorkspace =
        getWorkspaceById(workspaces, input.targetWorkspaceId ?? activeWorkspaceId) ??
        workspaces[0];
      const targetWorkspaceId = fallbackWorkspace.id;
      const summarySeed = buildPromotionSummary(input);
      const nextThread: AmplifyThread = {
        id: createId("amplify-thread-promoted"),
        title: input.sourceChatTitle,
        preview: "Promoted from global chat for focused Amplify strategy work.",
        lastViewedLabel: "Created just now",
        summarySeed,
        source: {
          sourceChatId: input.sourceChatId,
          summary: summarySeed,
          promotedFromLinkIds: input.promotedFromLinkIds,
        },
        messages: [
          {
            id: createId("amplify-thread-promoted-ai"),
            role: "ai",
            content:
              "I’ve turned the relevant part of the general chat into a focused Amplify thread. We can refine this strategy here without carrying over the whole broad transcript.",
          },
        ],
      };

      setWorkspaces((currentWorkspaces) =>
        currentWorkspaces.map((workspace) =>
          workspace.id === targetWorkspaceId
            ? {
                ...workspace,
                activeThreadId: nextThread.id,
                threads: [...workspace.threads, nextThread],
              }
            : workspace
        )
      );
      setActiveWorkspaceIdState(targetWorkspaceId);

      return nextThread;
    },
    [activeWorkspaceId, workspaces]
  );

  const workspace =
    getWorkspaceById(workspaces, activeWorkspaceId) ?? buildBlankWorkspace();
  const activeThread =
    workspace.threads.find((thread) => thread.id === workspace.activeThreadId) ??
    workspace.threads[0];
  const recentThreads = workspace.threads.filter(
    (thread) => thread.id !== activeThread.id
  );

  const value = useMemo(
    () => ({
      workspaces,
      workspace,
      activeThread,
      recentThreads,
      setActiveWorkspaceId,
      createWorkspace,
      updateWorkspaceGraph,
      setActiveThreadId,
      createBlankThread,
      getPromotedThreadBySourceChatId,
      promoteGlobalChatToThread,
    }),
    [
      workspaces,
      workspace,
      activeThread,
      recentThreads,
      setActiveWorkspaceId,
      createWorkspace,
      updateWorkspaceGraph,
      setActiveThreadId,
      createBlankThread,
      getPromotedThreadBySourceChatId,
      promoteGlobalChatToThread,
    ]
  );

  return (
    <AmplifyWorkspaceContext.Provider value={value}>
      {children}
    </AmplifyWorkspaceContext.Provider>
  );
}

export function useAmplifyWorkspace() {
  const context = useContext(AmplifyWorkspaceContext);

  if (!context) {
    throw new Error(
      "useAmplifyWorkspace must be used within AmplifyWorkspaceProvider."
    );
  }

  return context;
}
