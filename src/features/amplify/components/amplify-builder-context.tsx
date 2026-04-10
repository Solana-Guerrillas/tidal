"use client";

import { createContext, useContext } from "react";

type AmplifyBuilderContextValue = {
  isEditable: boolean;
};

const AmplifyBuilderContext = createContext<AmplifyBuilderContextValue | null>(
  null
);

export function AmplifyBuilderContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AmplifyBuilderContextValue;
}) {
  return (
    <AmplifyBuilderContext.Provider value={value}>
      {children}
    </AmplifyBuilderContext.Provider>
  );
}

export function useAmplifyBuilderContext() {
  return useContext(AmplifyBuilderContext);
}
