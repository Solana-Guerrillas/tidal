import {
  amplifyWorkspaceSummaries,
  globalChats,
  poolWorkspaceSummaries,
} from "./hybrid-chat";
import type { SidebarNavigation } from "../types";

export const sidebarNavigation: SidebarNavigation = {
  poolItems: poolWorkspaceSummaries.map((workspace) => ({
    id: workspace.id,
    title: workspace.title,
    href: workspace.href,
  })),
  amplifyItems: amplifyWorkspaceSummaries.map((workspace) => ({
    id: workspace.id,
    title: workspace.title,
    href: workspace.href,
  })),
  globalChats,
  userName: "Alex Thompson",
  wallet: {
    addressLabel: "7X4P...9KLM",
    solBalanceLabel: "182.43 SOL",
    usdBalanceLabel: "$31,284.19",
  },
};
