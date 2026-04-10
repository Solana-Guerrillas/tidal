"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import { Badge } from "@/components/tidal/badge";
import { SurfaceCard } from "@/components/tidal/surface-card";
import type { AmountNodeType } from "@/mock-data/amplify/types";

function formatStatusLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const AmountNode = memo(
  ({ data, isConnectable }: NodeProps<AmountNodeType>) => {
    return (
      <SurfaceCard className="w-[220px] bg-[#15202E]">
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="h-3! w-3! rounded-full! border-2! border-tidal-accent! bg-tidal-card!"
        />

        <div className="mb-3 flex items-center justify-between">
          <span className="tidal-text-eyebrow">{data.title}</span>
          <Badge variant="status">{formatStatusLabel(data.status)}</Badge>
        </div>

        <p className="mb-3 tidal-text-caption text-tidal-muted">{data.summary}</p>

        <div className="mb-3 flex items-center gap-2 tidal-text-caption">
          <Badge variant="token" size="xs">
            {data.sourceAsset}
          </Badge>
          <span className="text-foreground">{data.amountLabel}</span>
        </div>

        <div className="tidal-text-caption text-foreground">{data.maxAmountLabel}</div>

        <Handle
          type="source"
          position={Position.Right}
          id="next"
          isConnectable={isConnectable}
          className="h-3! w-3! rounded-full! border-2! border-tidal-accent! bg-tidal-card!"
        />
      </SurfaceCard>
    );
  }
);

AmountNode.displayName = "AmountNode";
