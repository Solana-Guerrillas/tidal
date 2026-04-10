import type { Edge } from "@xyflow/react";

import type {
  AmplifyGraphNode,
  AmplifyNodeCatalogItem,
  AmplifyWorkspace,
  AmountNodeType,
  DestinationNodeType,
  RewardNodeType,
  SplitNodeType,
  StrategyNodeType,
  WalletNodeType,
} from "../types";

export const amplifySuggestions = [
  "Optimise this strategy",
  "Add a new node",
  "Show risk breakdown",
];

export const amplifySupportedAssets = [
  "SOL",
  "USDC",
  "mSOL",
  "mSOL yield",
  "LP Fees",
  "Interest",
  "MNDE rewards",
  "MRGN rewards",
  "ORCA rewards",
  "RAY rewards",
] as const;

export const amplifyNodeCatalog: AmplifyNodeCatalogItem[] = [
  {
    id: "amount",
    title: "Set amount",
    description: "Choose a fixed amount or percentage before routing funds.",
    nodeKind: "amount",
    supportedInputAssets: [...amplifySupportedAssets],
    primaryOutputAsset: "Selected asset",
  },
  {
    id: "split",
    title: "Split funds",
    description: "Branch one asset stream into two downstream paths.",
    nodeKind: "split",
    supportedInputAssets: [...amplifySupportedAssets],
    primaryOutputAsset: "Split output",
  },
  {
    id: "destination",
    title: "Send to wallet",
    description: "Route assets or rewards back into the wallet.",
    nodeKind: "destination",
    supportedInputAssets: [...amplifySupportedAssets],
  },
  {
    id: "reward",
    title: "Collect rewards",
    description: "Model a reward collection step before routing it elsewhere.",
    nodeKind: "reward",
    supportedInputAssets: [
      "LP Fees",
      "Interest",
      "MNDE rewards",
      "MRGN rewards",
      "ORCA rewards",
      "RAY rewards",
      "mSOL yield",
    ],
    primaryOutputAsset: "Collected rewards",
  },
  {
    id: "marinade-stake",
    title: "Stake with Marinade",
    description: "Convert SOL into a liquid staking position.",
    nodeKind: "strategy",
    supportedInputAssets: ["SOL"],
    primaryOutputAsset: "mSOL",
  },
  {
    id: "kamino-borrow",
    title: "Supply and borrow on Kamino",
    description: "Use mSOL as collateral and borrow USDC.",
    nodeKind: "strategy",
    supportedInputAssets: ["mSOL"],
    primaryOutputAsset: "USDC",
  },
  {
    id: "marginfi-lend",
    title: "Lend on Marginfi",
    description: "Supply USDC into a lower-volatility lending branch.",
    nodeKind: "strategy",
    supportedInputAssets: ["USDC"],
    primaryOutputAsset: "Interest",
  },
  {
    id: "drift-lend",
    title: "Lend on Drift",
    description: "Lend mSOL and route the resulting yield stream onward.",
    nodeKind: "strategy",
    supportedInputAssets: ["mSOL"],
    primaryOutputAsset: "mSOL yield",
  },
  {
    id: "orca-lp",
    title: "Provide liquidity on Orca",
    description: "Use mSOL or yield output in a concentrated LP branch.",
    nodeKind: "strategy",
    supportedInputAssets: ["mSOL", "mSOL yield"],
    primaryOutputAsset: "LP Fees",
  },
  {
    id: "raydium-lp",
    title: "Provide liquidity on Raydium",
    description: "Deploy USDC into a higher-yield LP route.",
    nodeKind: "strategy",
    supportedInputAssets: ["USDC"],
    primaryOutputAsset: "LP Fees",
  },
];

function createNodeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isCatalogItemCompatible(
  item: AmplifyNodeCatalogItem,
  asset?: string | null
) {
  if (!asset) {
    return true;
  }

  return item.supportedInputAssets.includes(asset);
}

function buildAmountNode(
  position: { x: number; y: number },
  sourceAsset?: string
): AmountNodeType {
  const assetLabel = sourceAsset ?? "Asset";

  return {
    id: createNodeId("amount"),
    type: "amount",
    position,
    data: {
      nodeKind: "amount",
      title: `${assetLabel} amount`,
      summary: sourceAsset
        ? `Choose how much ${sourceAsset} to route into the next node.`
        : "Choose a fixed amount or percentage before connecting this branch.",
      status: "draft",
      acceptedAssets: sourceAsset ? [sourceAsset] : [...amplifySupportedAssets],
      outputs: [
        {
          id: "next",
          label: "Selected amount",
          asset: assetLabel,
          kind: "primary",
          compatibleNodeTypes: ["strategy", "split", "destination"],
          amountLabel: sourceAsset ? `Custom ${sourceAsset}` : "Custom amount",
        },
      ],
      holdingsLabel: sourceAsset ? `Awaiting ${sourceAsset} input` : "Awaiting source asset",
      draftState: {
        hasChanges: true,
        changedFields: ["amount"],
      },
      sourceAsset: assetLabel,
      amountLabel: sourceAsset ? `50% ${sourceAsset}` : "Set amount",
      amountMode: "percent",
      maxAmountLabel: sourceAsset ? `Max ${sourceAsset}` : "Awaiting source",
    },
  };
}

function buildSplitNode(
  position: { x: number; y: number },
  sourceAsset?: string
): SplitNodeType {
  const assetLabel = sourceAsset ?? "Asset";

  return {
    id: createNodeId("split"),
    type: "split",
    position,
    data: {
      nodeKind: "split",
      title: `${assetLabel} split`,
      summary: sourceAsset
        ? `Branch ${sourceAsset} across two downstream paths.`
        : "Branch one asset stream into two downstream paths.",
      status: "draft",
      acceptedAssets: sourceAsset ? [sourceAsset] : [...amplifySupportedAssets],
      outputs: [
        {
          id: "a",
          label: "Path A",
          asset: sourceAsset ? `50% ${sourceAsset}` : "Path A",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
        },
        {
          id: "b",
          label: "Path B",
          asset: sourceAsset ? `50% ${sourceAsset}` : "Path B",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
        },
      ],
      holdingsLabel: sourceAsset ? `${sourceAsset} ready to route` : "Awaiting source asset",
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      splitA: 50,
      splitB: 50,
      asset: assetLabel,
    },
  };
}

function buildDestinationNode(
  position: { x: number; y: number },
  sourceAsset?: string
): DestinationNodeType {
  const assetLabel = sourceAsset ?? "Asset";

  return {
    id: createNodeId("destination"),
    type: "destination",
    position,
    data: {
      nodeKind: "destination",
      title: "Wallet destination",
      summary: sourceAsset
        ? `Send ${sourceAsset} back to wallet.`
        : "Route a branch back to wallet once it is connected.",
      status: "draft",
      acceptedAssets: sourceAsset ? [sourceAsset] : [...amplifySupportedAssets],
      outputs: [],
      holdingsLabel: sourceAsset ? `Ready to receive ${sourceAsset}` : "Awaiting source asset",
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      destinationLabel: "Primary wallet",
      asset: assetLabel,
    },
  };
}

function buildRewardNode(
  position: { x: number; y: number },
  sourceAsset?: string
): RewardNodeType {
  const assetLabel = sourceAsset ?? "Reward asset";

  return {
    id: createNodeId("reward"),
    type: "reward",
    position,
    data: {
      nodeKind: "reward",
      title: "Reward collector",
      summary: sourceAsset
        ? `Collect and route ${sourceAsset} before sending it onward.`
        : "Collect rewards before routing them elsewhere.",
      status: "draft",
      acceptedAssets: sourceAsset
        ? [sourceAsset]
        : [
            "LP Fees",
            "Interest",
            "MNDE rewards",
            "MRGN rewards",
            "ORCA rewards",
            "RAY rewards",
            "mSOL yield",
          ],
      outputs: [
        {
          id: "next",
          label: "Collected rewards",
          asset: assetLabel,
          kind: "reward",
          compatibleNodeTypes: ["split", "destination", "strategy"],
          cadenceLabel: "Weekly",
        },
      ],
      holdingsLabel: sourceAsset ? `${sourceAsset} ready to collect` : "Awaiting reward source",
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      sourceProtocol: "Custom source",
      rewardAsset: assetLabel,
      defaultInterval: "Weekly",
    },
  };
}

function buildStrategyNode(
  itemId: string,
  position: { x: number; y: number }
): StrategyNodeType {
  switch (itemId) {
    case "marinade-stake":
      return {
        id: createNodeId("strategy"),
        type: "strategy",
        position,
        data: {
          nodeKind: "strategy",
          title: "Marinade stake",
          summary: "Convert SOL into a liquid staking position.",
          protocol: "Marinade",
          action: "Stake SOL",
          inputAsset: "SOL",
          acceptedAssets: ["SOL"],
          outputs: [
            {
              id: "next",
              label: "Staked position",
              asset: "mSOL",
              kind: "primary",
              compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
            },
            {
              id: "rewards",
              label: "Reward stream",
              asset: "MNDE rewards",
              kind: "reward",
              compatibleNodeTypes: ["reward", "split", "destination"],
              cadenceLabel: "Weekly",
            },
          ],
          status: "draft",
          holdingsLabel: "Awaiting SOL input",
          platformLink: {
            label: "View on Marinade",
            href: "https://marinade.finance",
          },
          draftState: {
            hasChanges: false,
            changedFields: [],
          },
          apy: "7.5%",
          apyType: "earn",
          collectInterval: "Weekly",
        },
      };
    case "kamino-borrow":
      return {
        id: createNodeId("strategy"),
        type: "strategy",
        position,
        data: {
          nodeKind: "strategy",
          title: "Kamino supply and borrow",
          summary: "Use mSOL as collateral and borrow USDC.",
          protocol: "Kamino",
          action: "Supply & Borrow",
          inputAsset: "mSOL",
          acceptedAssets: ["mSOL"],
          outputs: [
            {
              id: "next",
              label: "Borrowed USDC",
              asset: "USDC",
              kind: "primary",
              compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
            },
          ],
          status: "draft",
          holdingsLabel: "Awaiting mSOL input",
          platformLink: {
            label: "View on Kamino",
            href: "https://app.kamino.finance",
          },
          draftState: {
            hasChanges: false,
            changedFields: [],
          },
          apy: "3.2%",
          apyType: "cost",
        },
      };
    case "marginfi-lend":
      return {
        id: createNodeId("strategy"),
        type: "strategy",
        position,
        data: {
          nodeKind: "strategy",
          title: "Marginfi lend leg",
          summary: "Supply USDC into a lower-volatility lending branch.",
          protocol: "Marginfi",
          action: "Lend USDC",
          inputAsset: "USDC",
          acceptedAssets: ["USDC"],
          outputs: [
            {
              id: "next",
              label: "Interest stream",
              asset: "Interest",
              kind: "primary",
              compatibleNodeTypes: ["reward", "split", "destination"],
            },
            {
              id: "rewards",
              label: "Lending rewards",
              asset: "MRGN rewards",
              kind: "reward",
              compatibleNodeTypes: ["reward", "split", "destination"],
              cadenceLabel: "Monthly",
            },
          ],
          status: "draft",
          holdingsLabel: "Awaiting USDC input",
          platformLink: {
            label: "View on Marginfi",
            href: "https://marginfi.com",
          },
          draftState: {
            hasChanges: false,
            changedFields: [],
          },
          apy: "8.4%",
          apyType: "earn",
          collectInterval: "Monthly",
        },
      };
    case "drift-lend":
      return {
        id: createNodeId("strategy"),
        type: "strategy",
        position,
        data: {
          nodeKind: "strategy",
          title: "Drift lend leg",
          summary: "Lend mSOL and route the resulting yield stream onward.",
          protocol: "Drift",
          action: "Lend mSOL",
          inputAsset: "mSOL",
          acceptedAssets: ["mSOL"],
          outputs: [
            {
              id: "next",
              label: "Yield stream",
              asset: "mSOL yield",
              kind: "primary",
              compatibleNodeTypes: ["reward", "split", "destination", "strategy"],
            },
            {
              id: "rewards",
              label: "Interest route",
              asset: "Interest",
              kind: "reward",
              compatibleNodeTypes: ["reward", "split", "destination"],
              cadenceLabel: "Monthly",
            },
          ],
          status: "draft",
          holdingsLabel: "Awaiting mSOL input",
          platformLink: {
            label: "View on Drift",
            href: "https://www.drift.trade",
          },
          draftState: {
            hasChanges: false,
            changedFields: [],
          },
          apy: "5.2%",
          apyType: "earn",
          collectInterval: "Monthly",
        },
      };
    case "orca-lp":
      return {
        id: createNodeId("strategy"),
        type: "strategy",
        position,
        data: {
          nodeKind: "strategy",
          title: "Orca concentrated LP",
          summary: "Use mSOL or yield output in a concentrated LP branch.",
          protocol: "Orca",
          action: "Concentrated LP",
          inputAsset: "mSOL",
          acceptedAssets: ["mSOL", "mSOL yield"],
          outputs: [
            {
              id: "next",
              label: "LP fee stream",
              asset: "LP Fees",
              kind: "primary",
              compatibleNodeTypes: ["reward", "split", "destination"],
            },
            {
              id: "rewards",
              label: "LP rewards",
              asset: "ORCA rewards",
              kind: "reward",
              compatibleNodeTypes: ["reward", "split", "destination"],
              cadenceLabel: "Bi-weekly",
            },
          ],
          status: "draft",
          holdingsLabel: "Awaiting mSOL input",
          platformLink: {
            label: "View on Orca",
            href: "https://www.orca.so",
          },
          draftState: {
            hasChanges: false,
            changedFields: [],
          },
          apy: "9.1%",
          apyType: "earn",
          collectInterval: "Bi-weekly",
        },
      };
    case "raydium-lp":
    default:
      return {
        id: createNodeId("strategy"),
        type: "strategy",
        position,
        data: {
          nodeKind: "strategy",
          title: "Raydium liquidity leg",
          summary: "Deploy USDC into a higher-yield LP route.",
          protocol: "Raydium",
          action: "Provide Liquidity",
          inputAsset: "USDC",
          acceptedAssets: ["USDC"],
          outputs: [
            {
              id: "next",
              label: "LP fee stream",
              asset: "LP Fees",
              kind: "primary",
              compatibleNodeTypes: ["reward", "split", "destination"],
            },
            {
              id: "rewards",
              label: "Harvest output",
              asset: "RAY rewards",
              kind: "reward",
              compatibleNodeTypes: ["reward", "split", "destination"],
              cadenceLabel: "Weekly",
            },
          ],
          status: "draft",
          holdingsLabel: "Awaiting USDC input",
          platformLink: {
            label: "View on Raydium",
            href: "https://raydium.io",
          },
          draftState: {
            hasChanges: false,
            changedFields: [],
          },
          apy: "12.0%",
          apyType: "earn",
          collectInterval: "Weekly",
        },
      };
  }
}

export function createAmplifyNodeFromCatalog(
  itemId: string,
  position: { x: number; y: number },
  sourceAsset?: string
): AmplifyGraphNode | null {
  switch (itemId) {
    case "amount":
      return buildAmountNode(position, sourceAsset);
    case "split":
      return buildSplitNode(position, sourceAsset);
    case "destination":
      return buildDestinationNode(position, sourceAsset);
    case "reward":
      return buildRewardNode(position, sourceAsset);
    case "marinade-stake":
    case "kamino-borrow":
    case "marginfi-lend":
    case "drift-lend":
    case "orca-lp":
    case "raydium-lp":
      return buildStrategyNode(itemId, position);
    default:
      return null;
  }
}

export const amplifyBuilderNodes: AmplifyGraphNode[] = [
  {
    id: "wallet-primary",
    type: "wallet",
    position: { x: 0, y: 180 },
    data: {
      nodeKind: "wallet",
      title: "Primary wallet",
      summary: "Mocked wallet balances ready to seed a new Amplify loop.",
      description: "Start with mocked wallet balances and branch into a new loop.",
      status: "ready",
      acceptedAssets: [],
      outputs: [
        {
          id: "sol",
          label: "SOL balance",
          asset: "SOL",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
          amountLabel: "126.40 SOL",
        },
        {
          id: "usdc",
          label: "USDC balance",
          asset: "USDC",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
          amountLabel: "42,000 USDC",
        },
      ],
      holdingsLabel: "$60,449 available",
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      assets: [
        {
          symbol: "SOL",
          amountLabel: "126.40 SOL",
          valueLabel: "$18,449",
          outputId: "sol",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
        },
        {
          symbol: "USDC",
          amountLabel: "42,000 USDC",
          valueLabel: "$42,000",
          outputId: "usdc",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
        },
      ],
    },
  } satisfies WalletNodeType,
];

export const amplifyBuilderEdges: Edge<{ asset: string }>[] = [];

export const amplifyExampleNodes: AmplifyGraphNode[] = [
  {
    id: "marinade",
    type: "strategy",
    position: { x: 0, y: 200 },
    data: {
      nodeKind: "strategy",
      title: "Marinade stake",
      summary: "Stake SOL into liquid staking before routing the position downstream.",
      protocol: "Marinade",
      action: "Stake SOL",
      inputAsset: "SOL",
      acceptedAssets: ["SOL"],
      outputs: [
        {
          id: "next",
          label: "Staked position",
          asset: "mSOL",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
          amountLabel: "81.2 mSOL",
        },
        {
          id: "rewards",
          label: "Reward stream",
          asset: "MNDE rewards",
          kind: "reward",
          compatibleNodeTypes: ["reward", "split", "destination"],
          amountLabel: "12.4 MNDE",
          cadenceLabel: "Weekly",
        },
      ],
      status: "active",
      holdingsLabel: "81.2 mSOL on Marinade",
      platformLink: {
        label: "View on Marinade",
        href: "https://marinade.finance",
      },
      activeSnapshot: {
        status: "active",
        amountLabel: "81.2 mSOL",
        updatedAtLabel: "Updated 2h ago",
      },
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      apy: "7.5%",
      apyType: "earn",
      collectInterval: "Weekly",
    },
  } satisfies StrategyNodeType,
  {
    id: "split",
    type: "split",
    position: { x: 320, y: 210 },
    data: {
      nodeKind: "split",
      title: "mSOL split",
      summary: "Route the staked position across borrow and lend branches.",
      status: "active",
      acceptedAssets: ["mSOL"],
      outputs: [
        {
          id: "a",
          label: "Path A",
          asset: "50% mSOL",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
          amountLabel: "40.6 mSOL",
        },
        {
          id: "b",
          label: "Path B",
          asset: "50% mSOL",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
          amountLabel: "40.6 mSOL",
        },
      ],
      holdingsLabel: "81.2 mSOL routed",
      activeSnapshot: {
        status: "active",
        amountLabel: "81.2 mSOL",
        updatedAtLabel: "Updated 2h ago",
      },
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      splitA: 50,
      splitB: 50,
      asset: "mSOL",
    },
  } satisfies SplitNodeType,
  {
    id: "kamino",
    type: "strategy",
    position: { x: 580, y: 30 },
    data: {
      nodeKind: "strategy",
      title: "Kamino supply and borrow",
      summary: "Use mSOL as collateral and borrow USDC for the next loop branch.",
      protocol: "Kamino",
      action: "Supply & Borrow",
      inputAsset: "mSOL",
      acceptedAssets: ["mSOL"],
      outputs: [
        {
          id: "next",
          label: "Borrowed USDC",
          asset: "USDC",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
          amountLabel: "23,800 USDC",
        },
      ],
      status: "active",
      holdingsLabel: "40.6 mSOL collateralised",
      platformLink: {
        label: "View on Kamino",
        href: "https://app.kamino.finance",
      },
      activeSnapshot: {
        status: "active",
        amountLabel: "23,800 USDC borrowed",
        updatedAtLabel: "Updated 1h ago",
      },
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      apy: "3.2%",
      apyType: "cost",
    },
  } satisfies StrategyNodeType,
  {
    id: "split-usdc",
    type: "split",
    position: { x: 880, y: 40 },
    data: {
      nodeKind: "split",
      title: "USDC split",
      summary: "Divide borrowed stablecoin across LP and lending branches.",
      status: "active",
      acceptedAssets: ["USDC"],
      outputs: [
        {
          id: "a",
          label: "Path A",
          asset: "30% USDC",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
          amountLabel: "7,140 USDC",
        },
        {
          id: "b",
          label: "Path B",
          asset: "70% USDC",
          kind: "primary",
          compatibleNodeTypes: ["amount", "strategy", "split", "destination"],
          amountLabel: "16,660 USDC",
        },
      ],
      holdingsLabel: "23,800 USDC routed",
      activeSnapshot: {
        status: "active",
        amountLabel: "23,800 USDC",
        updatedAtLabel: "Updated 1h ago",
      },
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      splitA: 30,
      splitB: 70,
      asset: "USDC",
    },
  } satisfies SplitNodeType,
  {
    id: "raydium",
    type: "strategy",
    position: { x: 1140, y: -100 },
    data: {
      nodeKind: "strategy",
      title: "Raydium liquidity leg",
      summary: "Deploy part of the borrowed stablecoin into a higher-yield LP branch.",
      protocol: "Raydium",
      action: "Provide Liquidity",
      inputAsset: "USDC",
      acceptedAssets: ["USDC"],
      outputs: [
        {
          id: "next",
          label: "LP fee stream",
          asset: "LP Fees",
          kind: "primary",
          compatibleNodeTypes: ["reward", "split", "destination"],
          amountLabel: "$824 / month",
        },
        {
          id: "rewards",
          label: "Harvest output",
          asset: "RAY rewards",
          kind: "reward",
          compatibleNodeTypes: ["reward", "split", "destination"],
          amountLabel: "146 RAY",
          cadenceLabel: "Weekly",
        },
      ],
      status: "active",
      holdingsLabel: "7,140 USDC deployed",
      platformLink: {
        label: "View on Raydium",
        href: "https://raydium.io",
      },
      activeSnapshot: {
        status: "active",
        amountLabel: "7,140 USDC",
        updatedAtLabel: "Updated 40m ago",
      },
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      apy: "12.0%",
      apyType: "earn",
      collectInterval: "Weekly",
    },
  } satisfies StrategyNodeType,
  {
    id: "marginfi",
    type: "strategy",
    position: { x: 1140, y: 180 },
    data: {
      nodeKind: "strategy",
      title: "Marginfi lend leg",
      summary: "Park the remaining stablecoin in a lower-volatility lending branch.",
      protocol: "Marginfi",
      action: "Lend USDC",
      inputAsset: "USDC",
      acceptedAssets: ["USDC"],
      outputs: [
        {
          id: "next",
          label: "Interest stream",
          asset: "Interest",
          kind: "primary",
          compatibleNodeTypes: ["reward", "split", "destination"],
          amountLabel: "$116 / month",
        },
        {
          id: "rewards",
          label: "Lending rewards",
          asset: "MRGN rewards",
          kind: "reward",
          compatibleNodeTypes: ["reward", "split", "destination"],
          amountLabel: "88 MRGN",
          cadenceLabel: "Monthly",
        },
      ],
      status: "active",
      holdingsLabel: "16,660 USDC supplied",
      platformLink: {
        label: "View on Marginfi",
        href: "https://marginfi.com",
      },
      activeSnapshot: {
        status: "active",
        amountLabel: "16,660 USDC",
        updatedAtLabel: "Updated 40m ago",
      },
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      apy: "8.4%",
      apyType: "earn",
      collectInterval: "Monthly",
    },
  } satisfies StrategyNodeType,
  {
    id: "drift",
    type: "strategy",
    position: { x: 580, y: 380 },
    data: {
      nodeKind: "strategy",
      title: "Drift lend leg",
      summary: "Lend the second mSOL branch while keeping a yield stream available for reinvestment.",
      protocol: "Drift",
      action: "Lend mSOL",
      inputAsset: "mSOL",
      acceptedAssets: ["mSOL"],
      outputs: [
        {
          id: "next",
          label: "Yield stream",
          asset: "mSOL yield",
          kind: "primary",
          compatibleNodeTypes: ["reward", "split", "destination", "strategy"],
          amountLabel: "2.11 mSOL / month",
        },
        {
          id: "rewards",
          label: "Interest route",
          asset: "Interest",
          kind: "reward",
          compatibleNodeTypes: ["reward", "split", "destination"],
          amountLabel: "$92 / month",
          cadenceLabel: "Monthly",
        },
      ],
      status: "active",
      holdingsLabel: "40.6 mSOL supplied",
      platformLink: {
        label: "View on Drift",
        href: "https://www.drift.trade",
      },
      activeSnapshot: {
        status: "active",
        amountLabel: "40.6 mSOL",
        updatedAtLabel: "Updated 55m ago",
      },
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      apy: "5.2%",
      apyType: "earn",
      collectInterval: "Monthly",
    },
  } satisfies StrategyNodeType,
  {
    id: "orca",
    type: "strategy",
    position: { x: 900, y: 380 },
    data: {
      nodeKind: "strategy",
      title: "Orca concentrated LP",
      summary: "Route Drift yield into a more aggressive mSOL LP branch.",
      protocol: "Orca",
      action: "Concentrated LP",
      inputAsset: "mSOL yield",
      acceptedAssets: ["mSOL yield", "mSOL"],
      outputs: [
        {
          id: "next",
          label: "LP fee stream",
          asset: "LP Fees",
          kind: "primary",
          compatibleNodeTypes: ["reward", "split", "destination"],
          amountLabel: "$148 / month",
        },
        {
          id: "rewards",
          label: "LP rewards",
          asset: "ORCA rewards",
          kind: "reward",
          compatibleNodeTypes: ["reward", "split", "destination"],
          amountLabel: "34 ORCA",
          cadenceLabel: "Bi-weekly",
        },
      ],
      status: "active",
      holdingsLabel: "2.11 mSOL yield recycled",
      platformLink: {
        label: "View on Orca",
        href: "https://www.orca.so",
      },
      activeSnapshot: {
        status: "active",
        amountLabel: "2.11 mSOL",
        updatedAtLabel: "Updated 20m ago",
      },
      draftState: {
        hasChanges: false,
        changedFields: [],
      },
      apy: "9.1%",
      apyType: "earn",
      collectInterval: "Bi-weekly",
    },
  } satisfies StrategyNodeType,
];

const mainEdgeStyle = { stroke: "#61B3CF", strokeWidth: 2 };

export const amplifyExampleEdges: Edge<{ asset: string }>[] = [
  {
    id: "e-marinade-split",
    source: "marinade",
    sourceHandle: "next",
    target: "split",
    type: "asset",
    data: { asset: "mSOL" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-split-kamino",
    source: "split",
    sourceHandle: "a",
    target: "kamino",
    type: "asset",
    data: { asset: "50% mSOL" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-split-drift",
    source: "split",
    sourceHandle: "b",
    target: "drift",
    type: "asset",
    data: { asset: "50% mSOL" },
    style: { ...mainEdgeStyle, stroke: "#34d399" },
    animated: true,
  },
  {
    id: "e-kamino-split-usdc",
    source: "kamino",
    sourceHandle: "next",
    target: "split-usdc",
    type: "asset",
    data: { asset: "USDC" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-split-usdc-raydium",
    source: "split-usdc",
    sourceHandle: "a",
    target: "raydium",
    type: "asset",
    data: { asset: "30% USDC" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-split-usdc-marginfi",
    source: "split-usdc",
    sourceHandle: "b",
    target: "marginfi",
    type: "asset",
    data: { asset: "70% USDC" },
    style: mainEdgeStyle,
    animated: true,
  },
  {
    id: "e-drift-orca",
    source: "drift",
    sourceHandle: "next",
    target: "orca",
    type: "asset",
    data: { asset: "mSOL yield" },
    style: { ...mainEdgeStyle, stroke: "#34d399" },
    animated: true,
  },
];

export const amplifyBuilderWorkspace: AmplifyWorkspace = {
  id: "amplify-new-strategy",
  name: "New Amplify Strategy",
  summary:
    "A blank builder workspace seeded with a wallet node so the user can design a new loop from scratch.",
  kind: "builder",
  isEditable: true,
  executionState: "draft",
  draftState: {
    updatedAtLabel: "Not run yet",
    changedNodeIds: [],
    impactedNodeIds: [],
  },
  activeThreadId: "amplify-thread-builder",
  threads: [
    {
      id: "amplify-thread-builder",
      title: "Builder thread",
      preview: "A fresh Amplify workspace for sketching a new reinvestment loop.",
      lastViewedLabel: "Ready to build",
      messages: [
        {
          id: "amplify-thread-builder-ai-1",
          role: "ai",
          content:
            "This blank Amplify workspace starts from your mocked wallet balances so you can build a strategy from scratch.",
        },
      ],
    },
  ],
  suggestions: [
    "Start from SOL",
    "Split wallet balance",
    "Map a reinvestment loop",
  ],
  nodes: amplifyBuilderNodes,
  edges: amplifyBuilderEdges,
};

export const amplifyExampleWorkspace: AmplifyWorkspace = {
  id: "amplify-sol-yield-loop",
  name: "SOL Yield Loop",
  summary:
    "A composable SOL yield loop that moves across staking, borrowing, and LP positions.",
  kind: "example",
  isEditable: false,
  executionState: "active",
  activeSnapshot: {
    updatedAtLabel: "Last simulated today",
    nodeIds: amplifyExampleNodes.map((node) => node.id),
  },
  draftState: {
    updatedAtLabel: "No draft changes",
    changedNodeIds: [],
    impactedNodeIds: [],
  },
  activeThreadId: "amplify-thread-loop-optimisation",
  threads: [
    {
      id: "amplify-thread-loop-optimisation",
      title: "Loop optimisation",
      preview: "Refining the current loop and comparing alternatives to Raydium.",
      lastViewedLabel: "Last viewed today",
      messages: [
        {
          id: "amplify-thread-loop-optimisation-ai-1",
          role: "ai",
          content:
            "Welcome to Tidal Amplify. I can help you build and optimise yield strategies across Solana protocols.",
        },
        {
          id: "amplify-thread-loop-optimisation-user-1",
          role: "user",
          content:
            "Can you help me improve the yield on this loop? I'd like to explore alternatives to Raydium for the liquidity step.",
        },
        {
          id: "amplify-thread-loop-optimisation-ai-2",
          role: "ai",
          content:
            "This strategy stakes SOL through Marinade, borrows USDC on Kamino, and provides liquidity on Raydium for a net estimated yield of ~16.3%.",
        },
      ],
    },
    {
      id: "amplify-thread-risk-review",
      title: "Risk review",
      preview: "Pressure-testing where the current loop is most exposed.",
      lastViewedLabel: "Last viewed yesterday",
      messages: [
        {
          id: "amplify-thread-risk-review-ai-1",
          role: "ai",
          content:
            "The main risk concentrations are Kamino borrow cost sensitivity and the LP leg on Raydium.",
        },
        {
          id: "amplify-thread-risk-review-user-1",
          role: "user",
          content:
            "Break down which step in the loop contributes most of the risk and where the yield could compress fastest.",
        },
      ],
    },
  ],
  suggestions: amplifySuggestions,
  nodes: amplifyExampleNodes,
  edges: amplifyExampleEdges,
};

export const amplifyInitialWorkspaces: AmplifyWorkspace[] = [
  amplifyBuilderWorkspace,
  amplifyExampleWorkspace,
];

export const amplifyInitialNodes = amplifyExampleNodes;
export const amplifyInitialEdges = amplifyExampleEdges;
