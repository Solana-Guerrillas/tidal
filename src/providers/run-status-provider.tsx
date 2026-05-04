"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { GraphExecutionEvent } from "@/lib/workspace/graph-exec";

export type RunNodeStatus = "running" | "succeeded" | "failed" | "skipped";

type RunStatusValue = {
  /**
   * Per-node status from the most recent (or in-flight) graph run.
   * Empty until a run starts. Persisted across renders until the next
   * `graph-started` event resets it, so users see the final state on
   * each node after a run completes.
   */
  statusByNodeId: ReadonlyMap<string, RunNodeStatus>;
  /**
   * Update the map from a single GraphExecutionEvent. Run handlers
   * call this inside their event consumption loop. `graph-started`
   * clears the map; node lifecycle events set the corresponding node's
   * status.
   */
  applyEvent: (event: GraphExecutionEvent) => void;
  /**
   * Manually clear all statuses. Useful for "Run again" buttons that
   * want a clean slate before re-running.
   */
  reset: () => void;
};

const RunStatusContext = createContext<RunStatusValue | null>(null);

export function RunStatusProvider({ children }: { children: ReactNode }) {
  const [statusByNodeId, setStatusByNodeId] = useState<
    ReadonlyMap<string, RunNodeStatus>
  >(() => new Map());

  const reset = useCallback(() => {
    setStatusByNodeId(new Map());
  }, []);

  const applyEvent = useCallback((event: GraphExecutionEvent) => {
    switch (event.kind) {
      case "graph-started":
        setStatusByNodeId(new Map());
        return;
      case "node-started":
        setStatusByNodeId((current) => {
          const next = new Map(current);
          next.set(event.nodeId, "running");
          return next;
        });
        return;
      case "node-succeeded":
        setStatusByNodeId((current) => {
          const next = new Map(current);
          next.set(event.nodeId, "succeeded");
          return next;
        });
        return;
      case "node-failed":
        setStatusByNodeId((current) => {
          const next = new Map(current);
          next.set(event.nodeId, "failed");
          return next;
        });
        return;
      case "node-skipped":
        setStatusByNodeId((current) => {
          const next = new Map(current);
          next.set(event.nodeId, "skipped");
          return next;
        });
        return;
      // graph-completed / graph-failed / graph-cancelled: leave the
      // current per-node statuses in place so users see the final
      // state of each node on the canvas after the run.
      default:
        return;
    }
  }, []);

  const value = useMemo<RunStatusValue>(
    () => ({ statusByNodeId, applyEvent, reset }),
    [statusByNodeId, applyEvent, reset],
  );

  return (
    <RunStatusContext.Provider value={value}>
      {children}
    </RunStatusContext.Provider>
  );
}

export function useRunStatus(): RunStatusValue {
  const ctx = useContext(RunStatusContext);
  if (!ctx) {
    throw new Error("useRunStatus must be used inside RunStatusProvider");
  }
  return ctx;
}

/**
 * Convenience hook: read a single node's status. Returns null when
 * the node has no run state yet.
 */
export function useNodeRunStatus(nodeId: string): RunNodeStatus | null {
  const { statusByNodeId } = useRunStatus();
  return statusByNodeId.get(nodeId) ?? null;
}
