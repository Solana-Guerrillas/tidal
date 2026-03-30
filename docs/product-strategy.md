# Tidal — Product Strategy

*Last updated: 30 March 2026*

---

## Contents

1. [Beachhead](#beachhead) — who we go after first and why
2. [Go-to-Market](#go-to-market) — how users find out about Tidal
3. [Business Model](#business-model) — pricing, tiers, and unit economics
4. [Competitive Landscape](#competitive-landscape) — alternatives, differentiation, and defensibility
5. [Strategic Sequence](#strategic-sequence) — ordered bets with success/failure signals
6. [Open Questions](#open-questions) — things resolved through learning, not planning
7. [Sources](#sources)

---

## Beachhead

### Who We Start With

The Solana Colosseum hackathon community — judges, fellow participants, and the broader ecosystem audience watching the hackathon. These are Solana-native people who understand DeFi, can evaluate the product on its merits, and are connected to wider networks in the ecosystem.

The beachhead is defined by access and timing, not market segment. The hackathon provides a built-in audience, a deadline, and a stage. The goal is to convert hackathon visibility into early adopters and warm connections that carry forward.

### Why This Beachhead

The hackathon gives Tidal three things simultaneously: a forcing function to ship, an informed audience to evaluate the product, and a credibility signal (hackathon participation/results) that aids future outreach. The community is already engaged with Solana DeFi and understands the problem Tidal is solving — they don't need to be educated on the space, only convinced on the approach.

### What "Winning" Looks Like

Strong hackathon reception — meaningful judge feedback, community attention, and interest from the ecosystem. 10-20 early users who try Tidal Pool post-hackathon, with at least 3-5 returning after the initial demo. Inbound interest from at least one protocol or potential collaborator. The hackathon is the launchpad, not the destination.

---

## Go-to-Market

### Three Channels, Sequenced by Stage

**Channel 1: Build in public on X (starts now, runs always)**

Share the building process during the hackathon. Every output from Tidal — a Pool recommendation, a swap route, an Amplify strategy — doubles as content. Post demos, share thinking, engage with Solana CT. This is the primary channel and it costs nothing.

The hackathon gives a natural narrative arc: "Here's what we're building for Colosseum, here's why, here's what it does." Every post is both content and product demo.

**Channel 2: Solana community presence (post-hackathon)**

Be active in Solana Discords and Telegram groups — not selling, but being helpful. Answer yield questions, share insights, build reputation. When someone asks "where should I put my USDC?", Tidal becomes the answer. This channel builds slowly but compounds.

**Channel 3: Protocol partnerships (with traction)**

Approach DeFi protocols (Kamino, Marinade, Jupiter, Raydium) once there's data showing users are discovering and deploying into their platforms through Tidal. These protocols benefit from a tool that routes users to their yields — but the pitch requires traction to be credible.

### Sequencing

**Hackathon period:** Build in public on X. The hackathon is the content.

**Months 1-3 post-hackathon:** X content continues. Begin community presence. Direct outreach to promising connections made during the hackathon.

**Months 3-6:** All three channels running. Protocol partnership conversations begin with traction data.

### A Note on Early-Stage GTM

The first 10-20 users will come from personal effort — hackathon connections, DMs, conversations in communities, and people who saw the build-in-public content. This is founder-led distribution. Scalable channels come later, once there's something worth scaling.

---

## Business Model

### Pricing Approach

Too early to lock in pricing. The 6-month goal is ecosystem recognition and a returning user base, not revenue. But the model should be designed now so the transition to paid is smooth.

### Likely Model (to validate)

**Free tier:** Tidal Pool in manual/conversational mode. Limited queries per day. Full access to recommendations and advisory.

**Pro tier (subscription):** Autonomous mode, unlimited queries, priority data. Estimated range: $10-30/month. The subscription is justified because autonomous mode runs AI continuously in the background — real compute cost that scales with active management.

**Transaction fees:** Small fee on swaps and position entries executed through Tidal. This aligns with how aggregators (Jupiter) already monetise and feels natural to users.

**Yield take rate (future consideration):** A small percentage of yield earned through Tidal-managed positions. This aligns Tidal's revenue with user success but is more complex to implement and explain. Save for later.

### Why Not Usage-Based

Usage-based pricing (per query, per recommendation) chills exploration. At this stage, learning what users value is more important than margin optimisation. The free tier should be generous enough that users experience the full value before hitting a paywall.

### Unit Economics (Rough)

SolEnrich data calls: ~$0.001 per request. LLM inference: the larger cost, especially for autonomous mode running continuously. Estimated cost per active user: $3-8/month depending on usage intensity. At $10-30/month subscription, gross margin is healthy (60-80%). Transaction fees are incremental revenue on top.

### Payment Infrastructure

Don't build it yet. Manual invoicing or simple Stripe for the first paying users. Move to crypto-native payments (USDC on Solana) when the overhead of manual billing justifies the infrastructure investment. The x402 protocol used by SolEnrich could serve as a model for Tidal's own payment layer eventually.

---

## Competitive Landscape

### Direct Competitors

**Neur (AI Copilot for Solana).** Open-source, full-stack AI chatbot for interacting with DeFi protocols, dApps, and NFTs. The closest to Tidal's conversational model. Strength: open-source community, broad protocol coverage. Where Tidal wins: Tidal isn't a single-action chatbot — the Pool concept (multi-position portfolio built through conversation), the manual-to-autonomous spectrum, and the three-surface platform (Pool + Swap + Amplify) offer a fundamentally broader experience. Risk: Neur is open-source and can evolve quickly with community contributions.

**The Hive (AI Yield Agent).** Won the Solana AI Hackathon, backed by SendAI ($60k prize). Automatically optimises returns across protocols and rebalances positions. Strength: proven concept, strong backing, hackathon credibility. Where Tidal wins: Tidal offers the full control spectrum (manual to autonomous) while The Hive is primarily autonomous. Tidal also includes Swap and Amplify — it's an investment platform, not just a yield optimiser. Risk: The Hive is well-funded and has a head start in the autonomous yield space.

### Adjacent Competitors

**Jupiter and DeFi aggregators.** Already the default for swaps, massive existing user base. Strength: best swap routing, trusted, established. Where Tidal wins: Jupiter helps users execute; Tidal helps users decide. The AI advisory and portfolio-level thinking are a different layer. Risk: Jupiter could add AI-powered recommendation features.

**Protocol-native vaults (Kamino vaults, Marinade, etc.).** Automated yield within a single protocol. Strength: simple, trusted, battle-tested. Where Tidal wins: Tidal works across protocols and builds diversified portfolios. Vaults are single-protocol, single-strategy. Risk: low — these are complementary. Tidal routes users into these vaults.

### The Biggest Competitor

**Doing nothing.** Most Solana users hold assets without actively earning yield. The friction of the current workflow makes inaction the default. Tidal wins by making the barrier low enough that inaction is no longer the path of least resistance. Every aspect of the go-to-market must address this — showing people what they're leaving on the table.

### Defensibility

**Hard to replicate:** The integrated three-surface experience (Pool + Swap + Amplify) under one natural language interface. Accumulated user preference data that makes recommendations better over time. The autonomous management layer with user-defined guardrails. Ecosystem relationships built through protocol partnerships.

**Easy to replicate:** Any single feature in isolation. The technology itself. The concept.

**The moat is the combination,** not any individual piece. A competitor can build a chatbot, or a yield optimiser, or a swap tool — but the integrated experience where a user builds a diversified DeFi portfolio through conversation and can gradually hand control to an autonomous agent is the differentiated whole.

---

## Strategic Sequence

### Bet 1: Prove the Vision (Hackathon Period)

**What it tests:** Can all three product surfaces work together in a coherent experience?

**What you build:** A working beta with Tidal Pool (conversational advisory + recommendations), Tidal Swap (many-to-many token swaps), and Tidal Amplify (node-based strategy builder) — even if Amplify is rough. The goal is to demonstrate the breadth and coherence of the vision, not polish any single feature. Pool and Swap should be solid; Amplify can be a working prototype.

**Success signal:** Strong hackathon reception. Judges and community understand the vision and see the three surfaces as a coherent platform, not disconnected features. People want to try it.

**Failure signal:** The breadth feels scattered rather than coherent. Users don't understand how the pieces connect. The AI recommendations feel generic or unreliable.

### Bet 2: Prove People Come Back (Months 1-3 Post-Hackathon)

**What it tests:** Do users return after the initial demo? Is Tidal Pool useful enough to become a habit?

**What you build:** Polish Pool and Swap based on hackathon feedback. Improve recommendation quality. Add execution capability (not just recommendations — users can deploy capital through Tidal). Build in public on X. Grow from hackathon contacts into a broader Solana community user base.

**Success signal:** 10-20 active users. Returning usage (not just one-time tries). Users deploying real capital through Tidal. Inbound interest.

**Failure signal:** Users try once and don't return. Recommendations aren't trusted enough to act on. No organic interest beyond the hackathon network.

### Bet 3: Prove Autonomous Mode Earns Trust (Months 3-6)

**What it tests:** Will users hand over control to an AI agent managing real assets?

**What you build:** Autonomous mode with clear guardrails (approved protocols, risk limits, position size caps). Transparent action logging — every autonomous decision is explained. The manual-to-autonomous switch. This is where Tidal's real differentiation lives.

**Success signal:** A meaningful percentage of active users opt into autonomous mode. Low churn from autonomous users. Users increase their managed assets over time (trust is growing).

**Failure signal:** Users won't enable autonomous mode even after extended manual use. Or they enable it and immediately turn it off after the first autonomous action.

### Bet 4: Prove the Platform (Months 6-12)

**What it tests:** Can Tidal scale as a business and a platform?

**What you build:** Protocol partnerships (Kamino, Marinade, Jupiter integrations). Pricing and billing infrastructure. Tidal Amplify refinement for advanced users. Broader user acquisition.

**Only build this if Bets 1-3 have validated demand and trust.** The details of Bet 4 will be shaped entirely by what's learned in the first 6 months.

---

## Open Questions

These will be resolved through learning, not planning:

- Exact pricing and tier structure — needs real usage data to calibrate
- Whether the free tier should include execution or only recommendations
- How aggressive autonomous mode guardrails need to be for users to feel safe
- Which protocols to prioritise for deepest integration (driven by user demand)
- Whether Amplify resonates with enough users to justify continued investment, or whether Pool + Swap is the real product
- Token / crypto-native monetisation possibilities (protocol revenue sharing, referral fees from DeFi platforms)
- The right balance of hackathon ambition vs. polish — showing all three surfaces risks none being polished enough

---

## Sources

- [How to Build a Solana AI Agent in 2026 — Alchemy](https://www.alchemy.com/blog/how-to-build-solana-ai-agents-in-2026)
- [Solana AI Hackathon: Unveiling the Best AI Agents](https://coinlaunch.space/blog/solana-ai-hackathon-the-best-ai-agents/)
- [Solana Agent Kit — GitHub](https://github.com/sendaifun/solana-agent-kit)
- [Top 7 AI Agent Tokens on Solana — BingX](https://bingx.com/en/learn/article/top-ai-agent-crypto-projects-in-solana-ecosystem)
- [Solana AI Innovation](https://solana.com/ai)
