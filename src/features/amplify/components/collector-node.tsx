"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Timer } from "@phosphor-icons/react";

import { CompactSelect } from "@/components/tidal/compact-select";
import { SurfaceCard } from "@/components/tidal/surface-card";
import {
  collectIntervals,
  type CollectorNodeType,
} from "@/mock-data/amplify/types";

export const CollectorNode = memo(
  ({ data, isConnectable }: NodeProps<CollectorNodeType>) => {
    const [interval, setInterval] = useState(data.defaultInterval);

    return (
      <SurfaceCard className="w-[160px]" tone="muted" padding="sm">
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="h-2.5! w-2.5! rounded-full! border-2! border-tidal-muted! bg-tidal-card!"
        />

        <div className="mb-2 flex items-center gap-1.5">
          <Timer weight="bold" className="h-3.5 w-3.5 text-tidal-muted" />
          <span className="tidal-text-caption font-semibold">
            Fee Collector
          </span>
        </div>

        <CompactSelect
          options={collectIntervals}
          value={interval}
          onChange={(nextInterval) => setInterval(nextInterval)}
        />
      </SurfaceCard>
    );
  }
);

CollectorNode.displayName = "CollectorNode";
