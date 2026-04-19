# CLAUDE.md

## Role

You are collaborating on Tidal, a Solana DeFi product whose design thesis is **ComfyUI for DeFi**: a visual, typed, composable canvas where users build yield strategies as node graphs and an AI agent composes graphs on their behalf.

Your job is to help build out the working product — backend adapters, AI agent, composition engine — while preserving the partner's existing frontend architecture.

## Required Reading (Before Product Or Architecture Decisions)

1. `docs/design-thesis.md` — names the ComfyUI paradigm, maps concepts to Tidal, and lists the engineering implications. Foundational.
2. `docs/tidal-prd.md` (v2.2+) — feature roadmap organized around the composition paradigm.
3. `docs/architecture.md` — current live frontend architecture and the backend layer plan.

If a request would bypass the typed-graph mental model (e.g., "let's just have the agent execute trades from chat without showing a graph"), push back — that's the anti-paradigm.

## Non-Negotiable Constraints

- All product data must be mocked.
- Do not add external API calls for product data.
- Do not add blockchain, RPC, Solana program, or wallet-adapter connections.
- Do not add real wallet integrations.
- Do not add production authentication, account, or transaction flows.
- Do not import live code from `_archive/`.
- Use Bun for all commands.

Use:

```bash
bun install
bun run dev
bun run lint
bun run build
bun add <package>
bunx <tool>
```

Do not use `npm install`, `npm run`, `yarn`, `pnpm`, or `npx`.

## Current Product

The product has consolidated around one live surface: the **workspace**.

A workspace is a node-based canvas with associated side panels:

- **Nodes**: searchable node catalog.
- **Chat**: mocked per-workspace transcript and history.
- **Investments**: mocked active positions and performance chart.
- **Discover**: mocked recommendations and discovery opportunities.
- **Templates**: placeholder starter graph gallery.

Multiple workspaces can be open at once and are shown as tabs in the header next to the Tidal logo. Workspace URLs are top-level routes like:

```text
/workspace-sol-yield-loop
```

Closing the active side panel should hide it and give the canvas the full available workspace area.

## Live Architecture

Read `docs/architecture.md` for the full current architecture. The short version:

```text
src/mock-data/*
  -> src/providers/*
  -> src/components/workspace/workspace-screen.tsx
  -> workspace panels, canvas nodes, and tidal components
```

Important live folders:

- `src/app`: Next.js routes, global layout, and global CSS.
- `src/components/ui`: generic UI primitives.
- `src/components/tidal`: branded Tidal components and app shell pieces.
- `src/components/workspace`: the only live product surface.
- `src/providers`: local mocked state providers.
- `src/hooks/workspace`: React Flow canvas behavior and graph interaction logic.
- `src/lib/workspace`: pure graph, picker, and status helpers.
- `src/mock-data/shell`: mocked shell/preference data.
- `src/mock-data/workspace`: mocked workspace data, graph seeds, catalog, investments, discover, templates, and types.

Live routes:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/[workspaceId]/page.tsx`

There are no live Home, Pool, Swap, Global Chat, or Amplify routes.

## Archive

`_archive/` is frozen reference material from earlier product explorations. It is excluded from the live app.

You may inspect it for patterns, but do not import from it. If a pattern is useful, copy or adapt it into the live workspace architecture.

Do not describe archived surfaces as current product architecture.

## Implementation Rules

- Keep route files thin.
- Keep product-specific workspace UI under `src/components/workspace`.
- Keep reusable branded UI under `src/components/tidal`.
- Keep generic primitives under `src/components/ui`.
- Keep mock data and lightweight frontend-facing types under `src/mock-data`.
- Keep graph/domain helpers in `src/lib/workspace`.
- Keep canvas interaction state in `src/hooks/workspace`.
- Prefer existing patterns before introducing new abstractions.
- Avoid broad refactors unless they directly support the requested change.

## Graph And Canvas Rules

The workspace canvas uses React Flow.

Important graph conventions:

- `WorkspaceNodeOutput.asset` is the canonical asset identity used for compatibility checks.
- `WorkspaceNodeOutput.amountLabel` is display text.
- Edge `data.asset` is a display label.
- Do not put route percentages such as `50% SOL` in `output.asset`. Use `asset: "SOL"` and `amountLabel: "50% SOL"`.

The React Flow canvas is intentionally loaded client-only in `workspace-screen.tsx` using `next/dynamic({ ssr: false })`. This avoids hydration mismatches from browser-measured viewport transforms. Do not re-enable SSR for React Flow without verifying hydration.

## Styling Rules

The styling system is centralized in `src/app/globals.css`.

- Prefer semantic classes from `globals.css`.
- Promote repeated visual treatments into shared classes or `src/components/tidal`.
- Keep one-off Tailwind values limited and purposeful.
- Preserve the current dark Tidal visual language unless explicitly asked to change it.
- Keep responsive behavior in mind for panels, tabs, and canvas layout.

## Mocking And Future Integration

This repo is meant to be easy to integrate later.

When adding behavior:

- Model it with mocked data and local state.
- Keep boundaries clear enough that mocked data can be replaced by production adapters.
- Do not couple UI components directly to future backend assumptions.
- Do not add placeholder production clients.

The chat composer is presentational/prototype-level. Production chat behavior will be connected later outside this prototype.

## Docs Maintenance

When structural frontend changes are made:

- update `docs/architecture.md`
- update `README.md` if the developer-facing overview changes
- update `AGENTS.md` and `CLAUDE.md` if the AI guidance changes

Do not point docs at deleted or ignored planning files as required reading.

## Validation

For code changes, run the relevant checks with Bun:

```bash
bun run lint
bun run build
```

Note: the current build may require network access because `next/font/google` fetches Inter. If that becomes a problem, replace it with a local font or system font stack as a separate change.

## Backend Integration Phase (Active)

The frontend prototype is complete. The repo is now evolving into a working product per `docs/tidal-prd.md` (v2.1). Backend integration is in scope.

### Scope Of Existing Constraints

The "no external API calls / no blockchain / no wallet integrations" rules above apply to **workspace UI and mock-data patterns**. They do not block the backend layer described in the PRD. Specifically:

- Workspace UI should still consume data through provider boundaries in `src/providers/*`.
- `src/mock-data/*` stays as the seed/fallback path and remains the source of truth for types the UI depends on.
- New adapters slot behind the existing provider interface so the partner's UI keeps working as real calls come online.
- Do not couple workspace UI components directly to SDK clients — route through providers or API routes.

### Backend Layout

Per the PRD, new backend code lives at:

- `src/lib/solana/*` — protocol adapters (Kamino, Jupiter Lend, Jito, Sanctum, Jupiter swap, registry, connection)
- `src/lib/ai/*` — Vercel AI SDK v6 tools, prompts, Solana-specific tool definitions
- `src/app/api/*` — route handlers for `chat`, `yields`, `solana/rates`, `solana/positions`

Keep route handlers thin. Business logic belongs in `src/lib/*`, not in `app/api/*/route.ts`.

### Stack Additions

- **Wallet/Auth:** Privy with `walletChainType: 'ethereum-and-solana'` (Phantom/Backpack external + embedded wallets)
- **AI:** Vercel AI SDK v6 + Claude (model IDs per root instructions — default to latest Claude 4.x)
- **Swaps:** Jupiter Ultra API direct (2-endpoint `/order` → `/execute`, Beam relayer, no RPC needed)
- **Lending:** `@kamino-finance/klend-sdk`, Jupiter Lend API
- **Staking:** Jito stake pool (`@jito-foundation/jito-ts-sdk` or direct IX), Sanctum router
- **Perps/Lending (Phase 2):** `@drift-labs/sdk`
- **Yield Data:** DeFi Llama Yields API (filter `chain === "Solana"`)

Confirm exact package names against PRD before installing. Do not substitute deprecated alternatives.

### Out Of Scope (Parked From v1)

Do not re-introduce without explicit approval:

- EVM chain configs (Base, Arbitrum, Optimism)
- Li.Fi SDK (parked for future cross-chain phase)
- AAVE V3 adapters
- ERC-4626 vault adapter
- wagmi hooks (replaced by Solana wallet adapter / Privy Solana hooks)

### Testing Notes

- Mainnet with small amounts. Kamino, Jupiter, and Jito lack reliable devnet deployments.
- Never commit private keys, RPC URLs with embedded API keys, or Privy app secrets. Use `.env.local` and document required vars in `README.md` as they are added.

### Docs To Keep In Sync

When backend structure changes, update `docs/architecture.md` to reflect the new `src/lib/solana`, `src/lib/ai`, and `src/app/api` surfaces alongside the existing frontend architecture.

### Claude Code Skills To Use

When the following skills are available, prefer them over general reasoning for their respective domains:

- **`solana-dev`** — Wallet-standard connection (Phantom/Backpack), Privy Solana integration, `src/lib/solana/*` adapter patterns, and on-chain testing with LiteSVM / Mollusk / Surfpool. This is the testing backbone.
- **`integrating-jupiter`** — Jupiter Ultra Swap (`/order` → `/execute` via Beam relayer) and Jupiter Lend. Use when touching `src/lib/solana/jupiter-swap.ts` or `src/lib/solana/jupiter-lend.ts`.
- **`ai-sdk-core`** — Vercel AI SDK v6 tool definitions, streaming, error handling, MCP. Use when touching `src/lib/ai/*` or `src/app/api/chat/route.ts`.
- **`ai-sdk-ui`** — `useChat` and tool-approval patterns for the workspace chat panel. DeFi actions must require user signature — never auto-execute a transaction from a tool call without an explicit approval step.
- **`claude-api`** — For direct Anthropic SDK usage and prompt caching. Matters because agent tool-call contexts get long.
- **`prompt-engineering-patterns`** — When tuning the agent's system prompt and tool descriptions.

Skills explicitly **not** for this repo:

- `wagmi`, `viem`, `ethereum-wingman` — EVM-only, parked from v1
- `solana-anchor-claude-skill` — we consume existing programs, we don't author Anchor programs

If a skill is not listed here and it looks relevant, check availability before using it — the skill list changes.
