export const appModes = ["Chat", "Pool", "Swap", "Amplify"] as const;

export type AppMode = (typeof appModes)[number];

export const riskAppetiteLabels = [
  "Low Risk",
  "Medium Risk",
  "High Risk",
  "Show me options for all",
] as const;

export type RiskAppetiteLabel = (typeof riskAppetiteLabels)[number];

export const investmentInterestLabels = [
  "Lending / Borrowing",
  "Yield Farming",
  "Liquidity Provision",
  "Memecoins",
  "RWAs",
] as const;

export type InvestmentInterestLabel = (typeof investmentInterestLabels)[number];

export type PreferenceOption<TLabel extends string> = {
  label: TLabel;
  checked: boolean;
};

export type PreferenceProfile = {
  id: string;
  title: string;
  riskOptions: PreferenceOption<RiskAppetiteLabel>[];
  interestOptions: PreferenceOption<InvestmentInterestLabel>[];
};

export const workspaceEntityTypes = ["pool", "amplify"] as const;

export type WorkspaceEntityType = (typeof workspaceEntityTypes)[number];

export const mentionTargetKinds = [
  "pool",
  "amplify",
  "pool-position",
  "pool-recommendation",
  "pool-discovery",
  "amplify-strategy",
  "amplify-split",
] as const;

export type MentionTargetKind = (typeof mentionTargetKinds)[number];

export type WorkspaceSummary = {
  id: string;
  title: string;
  href?: string;
  summary?: string;
  workspaceType: WorkspaceEntityType;
};

export type SidebarItem = {
  id?: string;
  title: string;
  href?: string;
};

export type WalletSummary = {
  addressLabel: string;
  solBalanceLabel: string;
  usdBalanceLabel: string;
};

export type ChatLinkMode = "reference-only" | "focused-thread";

export type ChatLink = {
  id: string;
  targetId: string;
  targetKind: MentionTargetKind;
  label: string;
  workspaceType: WorkspaceEntityType;
  workspaceId: string;
  mode: ChatLinkMode;
};

export type WorkspaceActionType = "create" | "open";

export type CreateWorkspaceActionCard = {
  id: string;
  workspaceType: WorkspaceEntityType;
  actionType: WorkspaceActionType;
  title: string;
  description: string;
  primaryLabel: string;
  status: "pending" | "completed";
  targetWorkspaceId: string;
  targetWorkspaceTitle: string;
  completionLabel: string;
};

export type GlobalChatMessage = {
  id: string;
  role: "ai" | "user";
  content?: string;
  actionCard?: CreateWorkspaceActionCard;
};

export type GlobalChat = {
  id: string;
  title: string;
  preview: string;
  href?: string;
  lastViewedLabel: string;
  messages: GlobalChatMessage[];
  links: ChatLink[];
};

export type MentionTarget = {
  id: string;
  kind: MentionTargetKind;
  title: string;
  subtitle?: string;
  workspaceType: WorkspaceEntityType;
  workspaceId: string;
  href?: string;
};

export type PromotionSource = {
  sourceChatId: string;
  summary: string;
  promotedFromLinkIds?: string[];
};

export type WorkspaceThread = {
  id: string;
  workspaceType: WorkspaceEntityType;
  workspaceId: string;
  title: string;
  summarySeed: string;
  lastViewedLabel: string;
  messages: GlobalChatMessage[];
  source: PromotionSource;
};

export type SidebarNavigation = {
  poolItems: SidebarItem[];
  amplifyItems: SidebarItem[];
  globalChats: GlobalChat[];
  userName: string;
  wallet: WalletSummary;
};
