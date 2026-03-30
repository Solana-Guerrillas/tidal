"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type OnConnect,
  type Node,
  BackgroundVariant,
  EdgeLabelRenderer,
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useSidebar } from "@/components/ui/sidebar";
import {
  StrategyNode,
  type StrategyNodeData,
} from "@/components/amplify/strategy-node";
import { SplitNode, type SplitNodeData } from "@/components/amplify/split-node";
import { AmplifyChat } from "@/components/amplify/amplify-chat";

// Custom edge with asset label
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
          className="nodrag nopan rounded bg-tidal-sidebar-active px-2 py-1 text-[10px] font-medium text-tidal-accent shadow-md shadow-black/20"
        >
          {data?.asset}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  strategy: StrategyNode,
  split: SplitNode,
};
const edgeTypes = { asset: AssetEdge };

const initialNodes: (Node<StrategyNodeData> | Node<SplitNodeData>)[] = [
  // Entry: Marinade
  {
    id: "marinade",
    type: "strategy",
    position: { x: 0, y: 200 },
    data: {
      protocol: "Marinade",
      action: "Stake SOL",
      assetIn: "SOL",
      assetOut: "mSOL",
      apy: "7.5%",
      apyType: "earn",
      collectInterval: "Weekly",
    },
  },
  // Split node
  {
    id: "split",
    type: "split",
    position: { x: 320, y: 210 },
    data: { splitA: 50, splitB: 50, asset: "mSOL" },
  },

  // === Path A (top) ===
  {
    id: "kamino",
    type: "strategy",
    position: { x: 580, y: 30 },
    data: {
      protocol: "Kamino",
      action: "Supply & Borrow",
      assetIn: "mSOL",
      assetOut: "USDC",
      apy: "3.2%",
      apyType: "cost",
    },
  },
  // Split USDC after Kamino
  {
    id: "split-usdc",
    type: "split",
    position: { x: 880, y: 40 },
    data: { splitA: 30, splitB: 70, asset: "USDC" },
  },
  // Path A-1: 30% USDC → Raydium LP
  {
    id: "raydium",
    type: "strategy",
    position: { x: 1140, y: -100 },
    data: {
      protocol: "Raydium",
      action: "Provide Liquidity",
      assetIn: "USDC",
      assetOut: "LP Fees",
      apy: "12.0%",
      apyType: "earn",
      collectInterval: "Weekly",
    },
  },
  // Path A-2: 70% USDC → Marginfi Lending
  {
    id: "marginfi",
    type: "strategy",
    position: { x: 1140, y: 180 },
    data: {
      protocol: "Marginfi",
      action: "Lend USDC",
      assetIn: "USDC",
      assetOut: "Interest",
      apy: "8.4%",
      apyType: "earn",
      collectInterval: "Monthly",
    },
  },

  // === Path B (bottom) ===
  {
    id: "drift",
    type: "strategy",
    position: { x: 580, y: 380 },
    data: {
      protocol: "Drift",
      action: "Lend mSOL",
      assetIn: "mSOL",
      assetOut: "Interest",
      apy: "5.2%",
      apyType: "earn",
      collectInterval: "Monthly",
    },
  },
  {
    id: "orca",
    type: "strategy",
    position: { x: 900, y: 380 },
    data: {
      protocol: "Orca",
      action: "Concentrated LP",
      assetIn: "mSOL",
      assetOut: "LP Fees",
      apy: "9.1%",
      apyType: "earn",
      collectInterval: "Bi-weekly",
    },
  },
];

const mainEdgeStyle = { stroke: "#61B3CF", strokeWidth: 2 };

const initialEdges: Edge<{ asset: string }>[] = [
  {
    id: "e-marinade-split",
    source: "marinade",
    sourceHandle: "next",
    target: "split",
    type: "asset",
    data: { asset: "mSOL" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-split-kamino",
    source: "split",
    sourceHandle: "a",
    target: "kamino",
    type: "asset",
    data: { asset: "50% mSOL" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-split-drift",
    source: "split",
    sourceHandle: "b",
    target: "drift",
    type: "asset",
    data: { asset: "50% mSOL" },
    style: { ...mainEdgeStyle, stroke: "#34d399" },
    animated: true,
  },
  {
    id: "e-kamino-split-usdc",
    source: "kamino",
    sourceHandle: "next",
    target: "split-usdc",
    type: "asset",
    data: { asset: "USDC" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-split-usdc-raydium",
    source: "split-usdc",
    sourceHandle: "a",
    target: "raydium",
    type: "asset",
    data: { asset: "30% USDC" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-split-usdc-marginfi",
    source: "split-usdc",
    sourceHandle: "b",
    target: "marginfi",
    type: "asset",
    data: { asset: "70% USDC" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-drift-orca",
    source: "drift",
    sourceHandle: "next",
    target: "orca",
    type: "asset",
    data: { asset: "mSOL yield" },
    style: { ...mainEdgeStyle, stroke: "#34d399" },
    animated: true,
  },
];

export default function AmplifyPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { setOpen } = useSidebar();

  // Collapse sidebar on mount
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="flex h-screen w-full">
      {/* Chat panel */}
      <div className="flex w-[35%] shrink-0 flex-col border-r border-tidal-border py-5">
        <AmplifyChat />
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode="dark"
        >
          <Controls className="rounded-lg! border! border-tidal-border! bg-tidal-card! shadow-lg! shadow-black/20! [&>button]:border-tidal-border! [&>button]:bg-tidal-card! [&>button]:text-tidal-muted! [&>button:hover]:bg-tidal-sidebar-active! [&>button:hover]:text-tidal-accent!" />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#22292E"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
