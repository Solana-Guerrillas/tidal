"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type EdgeProps,
  type NodeChange,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  type ReactFlowInstance,
  BackgroundVariant,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useSidebar } from "@/components/ui/sidebar";
import { SurfaceCard } from "@/components/tidal/surface-card";
import { AmplifyChat } from "@/features/amplify/components/amplify-chat";
import { AmplifyBuilderContextProvider } from "@/features/amplify/components/amplify-builder-context";
import { AmountNode } from "@/features/amplify/components/amount-node";
import { DestinationNode } from "@/features/amplify/components/destination-node";
import { RewardNode } from "@/features/amplify/components/reward-node";
import { SplitNode } from "@/features/amplify/components/split-node";
import { StrategyNode } from "@/features/amplify/components/strategy-node";
import { WalletNode } from "@/features/amplify/components/wallet-node";
import { useAmplifyWorkspace } from "@/features/amplify/providers/amplify-workspace-provider";
import { PoolWorkspaceHeader } from "@/features/pool/components/pool-workspace-header";
import {
  amplifyNodeCatalog,
  createAmplifyNodeFromCatalog,
  isCatalogItemCompatible,
} from "@/mock-data/amplify/mocks/workspace";
import type {
  AmplifyGraphEdge,
  AmplifyGraphNode,
  AmplifyNodeCatalogItem,
  AmplifyNodeOutput,
} from "@/mock-data/amplify/types";

type PickerState = {
  mode: "pane" | "source";
  clientPosition: { x: number; y: number };
  flowPosition: { x: number; y: number };
  source?: {
    nodeId: string;
    outputId: string;
    asset: string;
  };
};

type PendingSourceConnection = {
  nodeId: string;
  outputId: string;
};

const STORAGE_KEY = "amplify-node-positions";
const mainEdgeStyle = { stroke: "#61B3CF", strokeWidth: 2 };

function AssetEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps<Edge<{ asset: string }>>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan tidal-overlay-label"
        >
          {data?.asset}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  wallet: WalletNode,
  amount: AmountNode,
  strategy: StrategyNode,
  split: SplitNode,
  reward: RewardNode,
  destination: DestinationNode,
};

const edgeTypes = { asset: AssetEdge };

function cloneGraphNode<TNode extends AmplifyGraphNode>(node: TNode): TNode {
  return {
    ...node,
    position: { ...node.position },
    data: { ...node.data },
  };
}

function cloneGraphEdge(edge: AmplifyGraphEdge): AmplifyGraphEdge {
  return {
    ...edge,
    style: edge.style ? { ...edge.style } : undefined,
    data: edge.data ? { ...edge.data } : undefined,
  };
}

function getOutputById(
  node: AmplifyGraphNode | undefined,
  outputId?: string | null
): AmplifyNodeOutput | null {
  if (!node) {
    return null;
  }

  if (!outputId) {
    return node.data.outputs[0] ?? null;
  }

  return node.data.outputs.find((output) => output.id === outputId) ?? null;
}

function applySourceAssetToNode(
  node: AmplifyGraphNode,
  sourceAsset: string
): AmplifyGraphNode {
  if (node.type === "amount") {
    return {
      ...node,
      data: {
        ...node.data,
        title: `${sourceAsset} amount`,
        summary: `Choose how much ${sourceAsset} to route into the next node.`,
        acceptedAssets: [sourceAsset],
        outputs: node.data.outputs.map((output) => ({
          ...output,
          asset: sourceAsset,
          amountLabel: `Custom ${sourceAsset}`,
        })),
        holdingsLabel: `Awaiting ${sourceAsset} input`,
        sourceAsset,
        amountLabel: `50% ${sourceAsset}`,
        maxAmountLabel: `Max ${sourceAsset}`,
      },
    };
  }

  if (node.type === "split") {
    return {
      ...node,
      data: {
        ...node.data,
        title: `${sourceAsset} split`,
        summary: `Branch ${sourceAsset} across two downstream paths.`,
        acceptedAssets: [sourceAsset],
        outputs: node.data.outputs.map((output) => ({
          ...output,
          asset: output.id === "a" ? `50% ${sourceAsset}` : `50% ${sourceAsset}`,
        })),
        holdingsLabel: `${sourceAsset} ready to route`,
        asset: sourceAsset,
      },
    };
  }

  if (node.type === "reward") {
    return {
      ...node,
      data: {
        ...node.data,
        summary: `Collect and route ${sourceAsset} before sending it onward.`,
        acceptedAssets: [sourceAsset],
        outputs: node.data.outputs.map((output) => ({
          ...output,
          asset: sourceAsset,
        })),
        holdingsLabel: `${sourceAsset} ready to collect`,
        rewardAsset: sourceAsset,
      },
    };
  }

  if (node.type === "destination") {
    return {
      ...node,
      data: {
        ...node.data,
        summary: `Send ${sourceAsset} back to wallet.`,
        acceptedAssets: [sourceAsset],
        holdingsLabel: `Ready to receive ${sourceAsset}`,
        asset: sourceAsset,
      },
    };
  }

  return node;
}

function canConnectAssetToNode(asset: string, node: AmplifyGraphNode) {
  return node.data.acceptedAssets.includes(asset);
}

function buildAssetEdge(
  sourceNodeId: string,
  sourceHandleId: string | null | undefined,
  targetNodeId: string,
  asset: string
): AmplifyGraphEdge {
  return {
    id: `e-${sourceNodeId}-${sourceHandleId ?? "next"}-${targetNodeId}`,
    source: sourceNodeId,
    sourceHandle: sourceHandleId ?? undefined,
    target: targetNodeId,
    type: "asset",
    data: { asset },
    style: mainEdgeStyle,
    animated: true,
  };
}

function getClientPosition(event: MouseEvent | TouchEvent) {
  if ("changedTouches" in event && event.changedTouches.length > 0) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  }

  const mouseEvent = event as MouseEvent;
  return {
    x: mouseEvent.clientX,
    y: mouseEvent.clientY,
  };
}

export function AmplifyWorkspace() {
  const {
    workspace,
    activeThread,
    setActiveThreadId,
    createBlankThread,
    updateWorkspaceGraph,
  } = useAmplifyWorkspace();
  const { setOpen } = useSidebar();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setOpen(false);
    }
  }, [setOpen]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <PoolWorkspaceHeader
        workspaceName={workspace.name}
        threads={workspace.threads}
        activeThreadId={activeThread.id}
        showOverviewTab={false}
        onThreadSelect={setActiveThreadId}
        onNewChat={createBlankThread}
        newChatLabel="New thread"
      />

      <div className="tidal-workspace">
        <div className="tidal-workspace-panel pt-0 pb-5">
          <AmplifyChat activeThread={activeThread} />
        </div>

        <AmplifyWorkspaceCanvas
          key={workspace.id}
          workspace={workspace}
          updateWorkspaceGraph={updateWorkspaceGraph}
        />
      </div>
    </div>
  );
}

function AmplifyWorkspaceCanvas({
  workspace,
  updateWorkspaceGraph,
}: {
  workspace: ReturnType<typeof useAmplifyWorkspace>["workspace"];
  updateWorkspaceGraph: ReturnType<typeof useAmplifyWorkspace>["updateWorkspaceGraph"];
}) {
  const workspaceStorageKey = `${STORAGE_KEY}-${workspace.id}`;
  const [pickerState, setPickerState] = useState<PickerState | null>(null);
  const pendingSourceConnectionRef = useRef<PendingSourceConnection | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<AmplifyGraphNode, AmplifyGraphEdge> | null>(null);
  const [nodes, setNodes] = useState<AmplifyGraphNode[]>(() => {
    const initialNodes = workspace.nodes.map((node) => cloneGraphNode(node));

    try {
      const saved = localStorage.getItem(workspaceStorageKey);
      if (!saved) {
        return initialNodes;
      }

      const positions: Record<string, { x: number; y: number }> = JSON.parse(saved);
      return initialNodes.map((node) =>
        positions[node.id] ? { ...node, position: positions[node.id] } : node
      );
    } catch {
      return initialNodes;
    }
  });
  const [edges, setEdges] = useState<AmplifyGraphEdge[]>(() =>
    workspace.edges.map((edge) => cloneGraphEdge(edge))
  );

  const persistGraph = useCallback(
    (nextNodes: AmplifyGraphNode[], nextEdges: AmplifyGraphEdge[]) => {
      updateWorkspaceGraph(
        workspace.id,
        nextNodes.map((node) => cloneGraphNode(node)),
        nextEdges.map((edge) => cloneGraphEdge(edge))
      );
    },
    [updateWorkspaceGraph, workspace.id]
  );

  const onNodeDragStop = useCallback(
    (_event: unknown, node: AmplifyGraphNode) => {
      const nextNodes = nodes.map((currentNode) =>
        currentNode.id === node.id ? { ...currentNode, position: node.position } : currentNode
      );

      const positions: Record<string, { x: number; y: number }> = {};
      for (const currentNode of nextNodes) {
        positions[currentNode.id] = currentNode.position;
      }

      localStorage.setItem(workspaceStorageKey, JSON.stringify(positions));
      setNodes(nextNodes);
      persistGraph(nextNodes, edges);
    },
    [edges, nodes, persistGraph, workspaceStorageKey]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<AmplifyGraphNode>[]) => {
      const nextNodes = applyNodeChanges(changes, nodes);
      setNodes(nextNodes);
      persistGraph(nextNodes, edges);
    },
    [edges, nodes, persistGraph]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<AmplifyGraphEdge>[]) => {
      const nextEdges = applyEdgeChanges(changes, edges);
      setEdges(nextEdges);
      persistGraph(nodes, nextEdges);
    },
    [edges, nodes, persistGraph]
  );

  const onConnectStart: OnConnectStart = useCallback(
    (_event, params) => {
      if (
        !workspace.isEditable ||
        params.handleType !== "source" ||
        !params.nodeId ||
        !params.handleId
      ) {
        pendingSourceConnectionRef.current = null;
        return;
      }

      pendingSourceConnectionRef.current = {
        nodeId: params.nodeId,
        outputId: params.handleId,
      };
    },
    [workspace.isEditable]
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);
      const output = getOutputById(sourceNode, params.sourceHandle);

      if (!sourceNode || !targetNode || !output) {
        return;
      }

      if (!canConnectAssetToNode(output.asset, targetNode)) {
        return;
      }

      const hydratedTarget = applySourceAssetToNode(targetNode, output.asset);
      const nextNodes = nodes.map((node) =>
        node.id === hydratedTarget.id ? hydratedTarget : node
      );
      const nextEdges = addEdge(
        buildAssetEdge(sourceNode.id, params.sourceHandle, targetNode.id, output.asset),
        edges
      );

      setNodes(nextNodes);
      setEdges(nextEdges);
      persistGraph(nextNodes, nextEdges);
    },
    [edges, nodes, persistGraph]
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      if (!workspace.isEditable || !reactFlowInstance) {
        pendingSourceConnectionRef.current = null;
        return;
      }

      const pendingConnection = pendingSourceConnectionRef.current;
      pendingSourceConnectionRef.current = null;

      if (!pendingConnection || connectionState.toNode) {
        return;
      }

      const sourceNode = nodes.find((node) => node.id === pendingConnection.nodeId);
      const output = getOutputById(sourceNode, pendingConnection.outputId);

      if (!sourceNode || !output) {
        return;
      }

      const clientPosition = getClientPosition(event);
      setPickerState({
        mode: "source",
        clientPosition,
        flowPosition: reactFlowInstance.screenToFlowPosition(clientPosition),
        source: {
          nodeId: pendingConnection.nodeId,
          outputId: pendingConnection.outputId,
          asset: output.asset,
        },
      });
    },
    [nodes, reactFlowInstance, workspace.isEditable]
  );

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | ReactMouseEvent) => {
      if (!workspace.isEditable || !reactFlowInstance) {
        return;
      }

      event.preventDefault();
      setPickerState({
        mode: "pane",
        clientPosition: { x: event.clientX, y: event.clientY },
        flowPosition: reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
      });
    },
    [reactFlowInstance, workspace.isEditable]
  );

  const handleCatalogSelect = useCallback(
    (item: AmplifyNodeCatalogItem) => {
      if (!pickerState) {
        return;
      }

      const sourceAsset = pickerState.source?.asset;
      if (pickerState.mode === "source" && !isCatalogItemCompatible(item, sourceAsset)) {
        return;
      }

      const basePosition =
        pickerState.mode === "source"
          ? {
              x: pickerState.flowPosition.x + 220,
              y: pickerState.flowPosition.y - 30,
            }
          : pickerState.flowPosition;
      const createdNode = createAmplifyNodeFromCatalog(
        item.id,
        basePosition,
        sourceAsset
      );

      if (!createdNode) {
        return;
      }

      const nextNodes = [...nodes, createdNode];
      let nextEdges = edges;

      if (pickerState.source) {
        nextEdges = [
          ...edges,
          buildAssetEdge(
            pickerState.source.nodeId,
            pickerState.source.outputId,
            createdNode.id,
            pickerState.source.asset
          ),
        ];
      }

      setNodes(nextNodes);
      setEdges(nextEdges);
      persistGraph(nextNodes, nextEdges);
      setPickerState(null);
    },
    [edges, nodes, persistGraph, pickerState]
  );

  const pickerItems = useMemo(() => {
    return amplifyNodeCatalog.map((item) => {
      const disabled =
        pickerState?.mode === "source" &&
        !isCatalogItemCompatible(item, pickerState.source?.asset);
      const disabledReason =
        disabled && pickerState?.source
          ? `Needs ${item.supportedInputAssets.join(" or ")} input`
          : null;

      return {
        item,
        disabled: Boolean(disabled),
        disabledReason,
      };
    });
  }, [pickerState]);

  return (
    <div className="tidal-workspace-canvas relative">
      <AmplifyBuilderContextProvider
        value={{
          isEditable: workspace.isEditable,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnectStart={onConnectStart}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onNodeDragStop={onNodeDragStop}
          onPaneContextMenu={onPaneContextMenu}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={workspace.isEditable}
          nodesConnectable={workspace.isEditable}
          elementsSelectable={workspace.isEditable}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode="dark"
        >
          <Controls className="tidal-flow-controls" />
          <Background
            variant={BackgroundVariant.Lines}
            gap={28}
            lineWidth={0.75}
            color="#1C2533"
          />
        </ReactFlow>
      </AmplifyBuilderContextProvider>

      {pickerState ? (
        <>
          <button
            type="button"
            aria-label="Close node picker"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setPickerState(null)}
          />
          <div
            className="fixed z-20 w-[320px]"
            style={{
              left: Math.max(12, pickerState.clientPosition.x + 10),
              top: Math.max(12, pickerState.clientPosition.y + 10),
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <SurfaceCard className="border border-tidal-border bg-tidal-card/95 shadow-lg shadow-black/30">
              <div className="mb-3">
                <div className="tidal-text-eyebrow">
                  {pickerState.mode === "source"
                    ? `Add node from ${pickerState.source?.asset ?? "output"}`
                    : "Create node"}
                </div>
                <p className="mt-1 tidal-text-caption text-tidal-muted">
                  {pickerState.mode === "source"
                    ? "Compatible items stay enabled. Incompatible items are shown but disabled."
                    : "Create a disconnected node anywhere on the canvas."}
                </p>
              </div>

              <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                {pickerItems.map(({ item, disabled, disabledReason }) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleCatalogSelect(item)}
                    className={`flex w-full cursor-pointer flex-col items-start rounded-lg border px-3 py-3 text-left transition-colors ${
                      disabled
                        ? "cursor-not-allowed border-tidal-border/50 bg-background/30 text-tidal-muted"
                        : "border-tidal-border bg-background/40 text-foreground hover:border-tidal-accent/40 hover:bg-tidal-sidebar-active"
                    }`}
                  >
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="mt-1 text-[11px] leading-tight opacity-80">
                      {item.description}
                    </span>
                    {disabledReason ? (
                      <span className="mt-2 text-[11px] leading-tight text-amber-400">
                        {disabledReason}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
