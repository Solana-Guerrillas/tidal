import type { NodeCatalogItem } from "@/mock-data/workspace/types";
import type { ProtocolAdapter, RiskTier } from "./types";

const adapters = new Map<string, ProtocolAdapter>();

export function registerAdapter(adapter: ProtocolAdapter): void {
  if (adapters.has(adapter.catalogItemId)) {
    throw new Error(
      `ProtocolAdapter for catalog item "${adapter.catalogItemId}" is already registered`,
    );
  }
  adapters.set(adapter.catalogItemId, adapter);
}

export function getAdapter(catalogItemId: string): ProtocolAdapter | undefined {
  return adapters.get(catalogItemId);
}

export function listAdapters(): ProtocolAdapter[] {
  return Array.from(adapters.values());
}

export function listAdaptersByRiskTier(tier: RiskTier): ProtocolAdapter[] {
  return listAdapters().filter(
    (adapter) => adapter.protocol.riskTier === tier,
  );
}

export function listCatalogItems(): NodeCatalogItem[] {
  return listAdapters().map((adapter) => adapter.catalogItem);
}

export function clearAdaptersForTesting(): void {
  adapters.clear();
}
