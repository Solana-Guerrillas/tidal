"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type OnConnect,
  BackgroundVariant,
  EdgeLabelRenderer,
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useSidebar } from "@/components/ui/sidebar";
import { AmplifyChat } from "@/features/amplify/components/amplify-chat";
import { SplitNode } from "@/features/amplify/components/split-node";
import { StrategyNode } from "@/features/amplify/components/strategy-node";
import {
  amplifyInitialEdges,
  amplifyInitialNodes,
  amplifyMessages,
  amplifySuggestions,
} from "@/mock-data/amplify/mocks/workspace";

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
  strategy: StrategyNode,
  split: SplitNode,
};

const edgeTypes = { asset: AssetEdge };

const STORAGE_KEY = "amplify-node-positions";

export function AmplifyWorkspace() {
  const [nodes, setNodes, onNodesChange] = useNodesState(amplifyInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(amplifyInitialEdges);
  const { setOpen } = useSidebar();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setOpen(false);
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const positions: Record<string, { x: number; y: number }> =
          JSON.parse(saved);

        setNodes((currentNodes) =>
          currentNodes.map((node) =>
            positions[node.id] ? { ...node, position: positions[node.id] } : node
          )
        );
      }
    } catch {
      // ignore invalid prototype persistence
    }
  }, [setNodes, setOpen]);

  const onNodeDragStop = useCallback(() => {
    setNodes((currentNodes) => {
      const positions: Record<string, { x: number; y: number }> = {};

      for (const node of currentNodes) {
        positions[node.id] = node.position;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
      return currentNodes;
    });
  }, [setNodes]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((currentEdges) => addEdge(params, currentEdges)),
    [setEdges]
  );

  return (
    <div className="tidal-workspace">
      <div className="tidal-workspace-panel">
        <AmplifyChat
          messages={amplifyMessages}
          suggestions={amplifySuggestions}
        />
      </div>

      <div className="tidal-workspace-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode="dark"
        >
          <Controls className="tidal-flow-controls" />
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
