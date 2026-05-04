import type { RunNodeStatus } from "@/providers/run-status-provider";

/**
 * Tailwind classes that paint a node's border ring based on its
 * current run lifecycle state. Returns an empty string when there's
 * no status (idle), so the node renders its default chrome.
 *
 * Using `ring-*` instead of `border-*` keeps the ring outside the
 * card's existing layout — the card width / padding don't shift when
 * the ring appears.
 */
export function runStatusRingClass(status: RunNodeStatus | null): string {
  switch (status) {
    case "running":
      return "ring-2 ring-cyan-400 animate-pulse";
    case "succeeded":
      return "ring-2 ring-emerald-400";
    case "failed":
      return "ring-2 ring-red-400";
    case "skipped":
      return "ring-2 ring-amber-400";
    case null:
    default:
      return "";
  }
}
