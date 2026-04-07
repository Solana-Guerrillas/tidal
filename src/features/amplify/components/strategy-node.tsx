"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Timer } from "@phosphor-icons/react";

import { Badge } from "@/components/tidal/badge";
import { CompactSelect } from "@/components/tidal/compact-select";
import { SurfaceCard } from "@/components/tidal/surface-card";
import {
  collectIntervals,
  type StrategyNodeType,
} from "@/mock-data/amplify/types";

export const StrategyNode = memo(
  ({ data, isConnectable }: NodeProps<StrategyNodeType>) => {
    const [interval, setInterval] = useState(data.collectInterval ?? "Weekly");
    const showCollector = data.apyType === "earn";

    return (
      <SurfaceCard className="w-[220px]" padding="none">
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="h-3! w-3! rounded-full! border-2! border-tidal-accent! bg-tidal-card!"
        />

        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-tidal-accent">
              {data.protocol}
            </span>
            <Badge variant="status">Active</Badge>
          </div>

          <div className="mb-3 text-[11px] font-medium text-foreground">
            {data.action}
          </div>

          <div className="mb-3 flex items-center gap-2 text-[10px] text-tidal-muted">
            <Badge variant="token" size="xs">
              {data.assetIn}
            </Badge>
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M1 4h10M8 1l3 3-3 3"
                stroke="#657F92"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Badge variant="token" size="xs">
              {data.assetOut}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold ${
                data.apyType === "earn" ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {data.apy}
            </span>
            <span className="text-[10px] text-tidal-muted">
              {data.apyType === "earn" ? "APY" : "Borrow Cost"}
            </span>
          </div>
        </div>

        {showCollector && (
          <div className="border-t border-tidal-border px-4 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Timer weight="bold" className="h-3 w-3 text-tidal-muted" />
              <span className="text-[10px] font-semibold text-tidal-muted">
                Fee Collector
              </span>
            </div>
            <CompactSelect
              options={collectIntervals}
              value={interval}
              onChange={setInterval}
            />
          </div>
        )}

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

StrategyNode.displayName = "StrategyNode";
