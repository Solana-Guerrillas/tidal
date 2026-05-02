"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChainStateSignalValue = {
  /**
   * Monotonically increasing counter. Hooks that fetch on-chain data
   * (wallet balances, positions, etc.) include this in their effect
   * deps so they refetch whenever something on chain has changed.
   */
  signal: number;
  /**
   * Bump the signal. Call after any successful on-chain action that
   * could change wallet balances or positions — e.g., after the
   * canvas Run button completes a graph, or after the AI compose
   * bubble's run finishes.
   */
  bumpSignal: () => void;
};

const ChainStateSignalContext = createContext<ChainStateSignalValue | null>(
  null,
);

export function ChainStateSignalProvider({ children }: { children: ReactNode }) {
  const [signal, setSignal] = useState(0);
  const bumpSignal = useCallback(() => {
    setSignal((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({ signal, bumpSignal }),
    [signal, bumpSignal],
  );

  return (
    <ChainStateSignalContext.Provider value={value}>
      {children}
    </ChainStateSignalContext.Provider>
  );
}

export function useChainStateSignal(): ChainStateSignalValue {
  const ctx = useContext(ChainStateSignalContext);
  if (!ctx) {
    throw new Error(
      "useChainStateSignal must be used inside ChainStateSignalProvider",
    );
  }
  return ctx;
}
