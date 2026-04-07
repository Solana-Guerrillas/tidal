"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import { SurfaceCard } from "@/components/tidal/surface-card";
import type { SplitNodeType } from "@/mock-data/amplify/types";

export const SplitNode = memo(
  ({ data, isConnectable }: NodeProps<SplitNodeType>) => {
    return (
      <SurfaceCard className="w-[180px]">
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="h-3! w-3! rounded-full! border-2! border-tidal-accent! bg-tidal-card!"
        />

        <div className="mb-3 tidal-text-eyebrow">Split {data.asset}</div>

        <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
          <div className="bg-tidal-accent" style={{ width: `${data.splitA}%` }} />
          <div className="bg-emerald-400" style={{ width: `${data.splitB}%` }} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between tidal-text-caption">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-tidal-accent" />
              <span className="text-foreground">Path A</span>
            </span>
            <span className="font-semibold text-tidal-accent">{data.splitA}%</span>
          </div>
          <div className="flex items-center justify-between tidal-text-caption">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-foreground">Path B</span>
            </span>
            <span className="font-semibold text-emerald-400">{data.splitB}%</span>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="a"
          isConnectable={isConnectable}
          className="h-3! w-3! rounded-full! border-2! border-tidal-accent! bg-tidal-card!"
          style={{ top: "30%" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="b"
          isConnectable={isConnectable}
          className="h-3! w-3! rounded-full! border-2! border-emerald-400! bg-tidal-card!"
          style={{ top: "70%" }}
        />
      </SurfaceCard>
    );
  }
);

SplitNode.displayName = "SplitNode";
