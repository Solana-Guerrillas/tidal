# Architecture

## Purpose

This repo is a prototype frontend for Tidal. It exists to explore product flows, visual patterns, and interaction structure before those interfaces are connected to the real application.

It is not the production app and should not contain real data integrations, wallet connections, or blockchain execution.

## Core Constraints

- All data is mocked
- No external API calls
- No Solana or wallet integration
- Frontend structure should stay integration-friendly for a later handoff

## Current Shape

After Phases 1, 2, and the initial Phase 3 restructure, the repo is organised around five broad layers:

### 1. App routes

Thin route files in `src/app` assemble screens and pass mocked data into components.

Current routes:

- `src/app/page.tsx`: home / landing prompt experience
- `src/app/amplify/page.tsx`: Amplify workspace prototype
- `src/app/layout.tsx`: shared shell, sidebar provider, tooltip provider

### 2. Shared UI components

Generic reusable primitives live in `src/components/ui`.

These components should remain product-agnostic and focused on rendering and interaction primitives rather than Tidal-specific meaning.

Examples:

- buttons
- inputs
- cards
- dropdown menus
- sidebar primitives

### 3. Tidal design components

Reusable branded product-facing building blocks live in `src/components/tidal`.

These components encode recurring Tidal interface patterns without owning feature data.

Current examples:

- `PromptComposer`
- `SuggestionAction`
- `SectionLabel`
- `ChatMessage`
- `WorkspaceButton`
- `SurfaceCard`
- `Badge`
- `CompactSelect`

### 4. Mock-data layer

Mocked data and lightweight types live under `src/mock-data`.

Current feature modules:

- `src/mock-data/shell`
- `src/mock-data/home`
- `src/mock-data/amplify`

These modules currently provide:

- typed mock navigation data for the shared shell
- typed mock home screen suggestions
- typed mock Amplify chat content and graph data

### 5. Feature modules

`src/features` is now the product-area layer.

This layer is intended for:

- screen-level composition by product area
- feature-owned components
- product-specific UI that is not generic enough for `src/components/tidal`

Planned feature areas:

- `src/features/shell`
- `src/features/home`
- `src/features/pool`
- `src/features/swap`
- `src/features/amplify`

## Data Flow

The intended prototype data flow is:

Current:

`mock-data/*/mocks` -> `features/*/screens` -> `features/*/components` and `components/tidal`

That means:

- mock content should not live directly inside UI component files
- components should receive content via props where practical
- route files should compose screens using feature data instead of embedding it

Examples in the current repo:

- sidebar navigation is sourced from `src/mock-data/shell/mocks/navigation.ts`
- home suggestions are sourced from `src/mock-data/home/mocks/home-screen.ts`
- Amplify messages, suggestions, nodes, and edges are sourced from `src/mock-data/amplify/mocks/workspace.ts`

## Current Feature Breakdown

### Shell

`src/mock-data/shell` contains app-wide prototype definitions that support the shared frame of the application.

Current responsibilities:

- app mode types
- sidebar navigation types
- mocked sidebar navigation content

### Home

`src/mock-data/home` currently holds the mocked content for the landing prompt screen.

Current responsibilities:

- home screen content types
- mocked suggestion content

### Amplify

`src/mock-data/amplify` currently holds the mock content and types for the Amplify prototype.

Current responsibilities:

- chat message typing
- strategy node typing
- split node typing
- mocked chat content
- mocked React Flow nodes and edges

## Component Boundary Rules

These are the current architectural rules for this repo:

### UI primitives

Files under `src/components/ui` should:

- remain generic
- avoid feature-specific mock content
- avoid Tidal-specific data assumptions

### Tidal design components

Files under `src/components/tidal` should:

- encode reusable branded interface patterns
- compose generic UI primitives
- accept data and state via props
- avoid owning feature-specific mock content

These components now cover:

- prompt/composer styling
- suggestion row and chip styling
- chat message treatments
- small workspace actions
- node/panel shells
- small badges and pills
- compact dropdown fields

### Shared product components

Files such as `src/features/shell/components/app-sidebar.tsx` should:

- accept data and state via props where practical
- stay reusable across multiple routes
- avoid owning embedded mock content

### Feature modules

Files under `src/features/*` should:

- group code by product area
- own screen composition for that area
- contain feature-specific components that do not belong in `components/tidal`
- keep the route layer thin
- stay separate from the `mock-data` layer

### Mock-data modules

Files under `src/mock-data/*` should:

- define lightweight frontend-facing types
- provide mocked content for the prototype
- be easy to replace later with integration adapters or real data sources

## Integration Guidance

When this prototype is later integrated into the real app, the intended replacement pattern is:

1. Keep presentational and shared components where they are if they remain useful.
2. Replace `mock-data/*/mocks` with real data adapters, view-model builders, or application state.
3. Preserve the prop boundaries rather than moving business logic back into UI files.
4. Continue to keep generic UI primitives separate from product-specific components.

The main integration goal is to swap data sources and state wiring, not to rewrite the visual layer from scratch.

## Planned Evolution

The architecture is expected to move further in this direction as `docs/codex-plan.md` progresses:

- continue expanding `src/components/tidal` for reusable branded product components
- introduce `src/features` as the product-area structure for Shell, Pool, Swap, and Amplify
- expand `src/mock-data` to include clearer Pool and Swap mock content
- keep `src/app` route files thin
- continue reducing screen-specific Tailwind duplication

## Maintenance Rule

Whenever structural frontend changes are made:

- update this file to reflect the new repo shape
- update `docs/codex-plan.md` to reflect progress against the cleanup plan
