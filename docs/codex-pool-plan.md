# Codex Pool Plan

## Purpose

This document is the implementation plan for the first real Tidal Pool workspace in this prototype repo.

It exists to do two jobs:

- explain the intended Pool workspace and how it fits into the current frontend structure
- provide a phased, checklist-friendly implementation tracker for building the first real Pool feature

Important framing:

- Pool is the first substantial feature being added on top of the current refactored repo structure
- this remains a prototype, so all Pool data, threads, actions, and explorer references stay mocked
- the goal is a handoff-friendly frontend feature, not production logic or live integration

## Working In This Codebase

Pool should be built within the structure that already exists in this repo.

### Current structure summary

- `src/app`
  Thin route entrypoints only. Routes should render feature screens rather than build large UI inline.
- `src/features/*`
  Product-area UI, screen composition, and feature-owned components.
- `src/mock-data/*`
  Mocked content and lightweight frontend-facing types.
- `src/components/ui`
  Generic primitives with no Tidal-specific meaning.
- `src/components/tidal`
  Shared branded Tidal components built on the primitives.
- `src/app/globals.css`
  The central styling-system home for tokens, semantic typography, layout helpers, and shared interface treatments.
- `docs/architecture.md`
  The broader repo architecture reference.
- `docs/codex-plan.md`
  The repo-wide refactor and cleanup history that established the current structure.

### Practical ownership rules

- if code only makes sense for Pool, keep it in `src/features/pool/*`
- if data only exists to power the Pool prototype, keep it in `src/mock-data/pool/*`
- if a visual pattern starts repeating across Pool, Swap, and Amplify, promote it to `src/components/tidal`
- `src/components/ui` stays generic and should not become a Pool feature folder in disguise

## Pool Feature Intent

Tidal Pool is a persistent investment workspace, not just a one-off chat.

The first Pool implementation should treat a Pool as:

- a persistent container for a user investment strategy
- a workspace with multiple chats associated with the same Pool
- a place where the user can research positions, compare opportunities, and take mocked actions
- a surface where the right-hand panel reflects current Pool state and branches into focused conversations

The initial Pool screen should represent an existing seeded Pool rather than an empty state.

That means the first Pool experience should already show:

- a named Pool
- existing positions
- existing performance data
- multiple associated chat threads
- recommendations, discovery items, and recent activity

## Pool Workspace V1

The first Pool implementation should be a full workspace, not an isolated panel experiment.

### Workspace shape

- a real Pool route under `src/app`
- the Pool route itself should land on an overview page for that Pool
- a Pool screen in `src/features/pool/screens`
- a top workspace header with the Pool name, an `Overview` tab, and chat tabs
- a left/main conversation area for Pool chats
- a right-hand Pool state panel
- a persistent Pool health area pinned at the bottom of the right panel
- full mocked sidebar Pool/chat switching in scope

### First right-panel tabs

- `My Pool`
- `Recommendations`
- `Discover`
- `Activity`

### Interaction model

The Pool feature should stay mocked, but the interactions should still feel coherent.

- clicking a position, recommendation, or discovery item can start a new focused chat
- focused chats still belong to the same Pool
- recommendation and discovery cards can also create mocked pending add-to-pool actions
- activity rows can show explorer-style references, but they should be visible and non-clickable
- no real protocol execution, transaction sending, wallet connection, or blockchain linking should exist in this repo

## Important Types And Interfaces

The Pool implementation should use explicit lightweight frontend-facing types so the feature does not grow ad hoc.

Expected concepts:

- `PoolWorkspace`
- `PoolThread`
- `PoolThreadContext`
- `PoolPanelTab`
- `PoolPosition`
- `PoolRecommendation`
- `PoolDiscoveryItem`
- `PoolActivityItem`
- `PoolHealthState`
- `PendingPoolAction`

These do not need to be over-engineered, but they should be clear enough that mocked Pool state can drive the full UI without hiding structure inside components.

## Phased Tracker

### Phase 0: Pool Foundations

Status: Complete

#### Goal

Create a complete mocked data model for the Pool workspace.

#### Tasks

- [x] add `src/mock-data/pool` types for Pool workspace entities
- [x] define seeded mock Pool state
- [x] define mock chats, positions, recommendations, discovery items, activity, and health data
- [x] define tab enums or view-state types needed for the Pool workspace

#### Deliverable

- [x] Pool has a complete mocked data model that can drive the feature UI

### Phase 1: Route And Workspace Shell

Status: Complete

#### Goal

Render a real Pool workspace route using the feature-first repo structure.

#### Tasks

- [x] add or wire a real Pool route under `src/app`
- [x] create the main Pool screen in `src/features/pool/screens`
- [x] add top Pool header with Pool name and chat tabs
- [x] add main layout split between chat area and right-hand panel
- [x] keep route files thin and feature-owned

#### Deliverable

- [x] a seeded Pool workspace renders as a real feature route

### Phase 2: Multi-Chat Model

Status: Complete

#### Goal

Make multiple mocked chats a first-class part of a single Pool.

#### Tasks

- [x] render existing Pool chats in the top header
- [x] add mocked `New chat` flow
- [x] support switching between chats
- [x] support creating focused chats from panel context
- [x] add sidebar Pool/chat switching UX

#### Deliverable

- [x] Pool supports multiple mocked chats scoped to one Pool

### Phase 3: Right-Hand Pool Panel

Status: Complete

#### Goal

Build the live Pool state surface on the right-hand side of the workspace.

#### Tasks

- [x] build the panel shell
- [x] add top summary/value cards
- [x] add tab navigation for `My Pool`, `Recommendations`, `Discover`, and `Activity`
- [x] build `My Pool` holdings and performance surface
- [x] build `Recommendations` action cards
- [x] build `Discover` protocol and opportunity cards
- [x] build `Activity` rows with mocked explorer references
- [x] keep Pool health pinned at the bottom

#### Deliverable

- [x] the right panel functions as the live Pool state surface

### Phase 4: Pool Actions And State Feedback

Status: Complete

#### Goal

Make mocked Pool actions visibly affect the workspace state.

#### Tasks

- [x] implement “use as chat context” style actions as focused chat creation
- [x] implement mocked add-to-pool or pending-action behavior
- [x] make panel actions visibly affect workspace state
- [x] ensure the active chat and panel context stay understandable

#### Deliverable

- [x] Pool interactions feel coherent even though they remain mocked

### Phase 5: Styling And Consistency Pass

Status: Complete

#### Goal

Make Pool feel like part of the existing Tidal product system.

#### Tasks

- [x] build Pool on top of `components/tidal` and `globals.css`
- [x] avoid introducing a separate styling system for Pool
- [x] make Pool responsive using the current semantic layout approach
- [x] extract any repeated Pool patterns that deserve reusable components
- [x] update docs if the feature introduces new shared patterns

#### Deliverable

- [x] Pool looks like part of the same product system as Home and Amplify

## File Ownership Guidance

Future Pool work should follow these file boundaries:

- `src/features/pool/screens`
  Pool screen composition and container-level workspace assembly
- `src/features/pool/components`
  Pool-only UI and feature-owned components
- `src/mock-data/pool`
  Pool mock content and lightweight types
- `src/components/tidal`
  reusable branded components extracted from Pool when they become shared cross-feature patterns
- `src/components/ui`
  generic primitives only

Rules to keep the codebase clean:

- if a component only makes sense for Pool, keep it in `src/features/pool/components`
- if a pattern starts repeating across Pool, Swap, and Amplify, promote it to `src/components/tidal`
- if a screen-level component starts owning too much mocked data, move that data back into `src/mock-data/pool`

## Test And Acceptance Scenarios

The Pool implementation should be considered ready for review when these scenarios are covered:

- [x] seeded Pool loads correctly
- [x] top header switches between chats
- [x] sidebar can switch Pool-associated chats
- [x] `New chat` creates a mocked new thread
- [x] using position, recommendation, or discovery context creates a focused chat
- [x] add-to-pool creates visible mocked pending state
- [x] each right-panel tab renders the correct mocked content
- [x] health area stays visible regardless of tab
- [x] layout remains usable on narrower screens
- [x] no action performs real execution or navigation to live external systems

## Success Criteria

- [x] Pool exists as a real route and feature screen
- [x] the workspace supports multiple mocked chats within one Pool
- [x] the right-hand panel reflects seeded Pool state
- [x] recommendations and discovery items can start focused chats
- [x] mocked add-to-pool actions are visible in the UI
- [x] sidebar and top header both reflect Pool and chat navigation
- [x] styling follows the established shared system
- [x] no real integrations are introduced

## Assumptions And Defaults

The following decisions are locked for the first Pool build:

- [x] Pool v1 is a full workspace build
- [x] the initial state is an existing seeded Pool
- [x] Pool supports multiple chats from the first implementation
- [x] top header tabs and sidebar Pool/chat switching are both in scope
- [x] the right panel uses tabs plus a persistent health area
- [x] the first tabs are `My Pool`, `Recommendations`, `Discover`, and `Activity`
- [x] recommendation and discovery cards support both research chat creation and mocked add-to-pool behavior
- [x] explorer references are shown for realism but are not clickable
- [x] all data and interactions remain mocked in this repo
