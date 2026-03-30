# Tidal — Product Vision

*Last updated: 29 March 2026*

---

## Contents

1. [North Star](#north-star) — mission statement and day-in-the-life narrative
2. [Who It's For](#who-its-for) — the target user, their current reality, and life with Tidal
3. [The Problem](#the-problem) — why the current workflow is broken
4. [The Insight](#the-insight) — the non-obvious truths that make Tidal the right solution
5. [Value Proposition](#value-proposition) — the pitch and competitive positioning
6. [Product Principles](#product-principles) — ranked tradeoff guides
7. [Build Sequence](#build-sequence) — the order the three surfaces ship
8. [Validation Status](#validation-status) — current evidence and untested assumptions
9. [Key Trends](#key-trends) — market and technology shifts Tidal is riding

---

## North Star

Tidal exists so that anyone holding assets on Solana can earn more from them — simply by asking.

In 2–3 years, Tidal is the place Solana users go when they want their crypto to work harder. A user with a mix of SOL, stablecoins, and memecoins opens Tidal and types: "I've got 50 SOL and 500 USDC — help me put this to work without taking big risks." Tidal comes back with a Pool — a recommended split across a few positions: some SOL staked through Marinade, USDC lent on Kamino, and a small stable LP on Raydium. Each position shows the risk level, expected yield, and which platform it's on. The user adjusts the mix through conversation — "less lending, more staking" — and deploys.

The user chooses how much control to hand over. In **manual mode**, Tidal is a conversational advisor — it recommends, the user decides, and nothing moves without approval. In **autonomous mode**, the user sets their parameters (risk tolerance, yield targets, preferred protocols) and Tidal actively manages the Pool: rebalancing when yields shift, rotating into better opportunities, and alerting the user to what it's done and why. The user can switch between modes at any time, and autonomous actions are always transparent and reversible.

When they want to consolidate memecoin dust, they describe the swap and Tidal routes it. Eventually, the most experienced users build complex yield loops visually through connected nodes. But for everyone, the core experience is the same: you set the level of control you're comfortable with, and your assets start earning.

---

## Who It's For

The primary user is **someone already active in the Solana ecosystem** — they hold assets (SOL, memecoins, stablecoins) and want to earn better returns from them. They might be a memecoin trader looking for yield on idle holdings, a SOL staker wondering if they could do better, or a DeFi-curious user who knows opportunities exist but hasn't figured out how to access them.

They are not DeFi power users. They discover opportunities through Crypto Twitter, Telegram, and word of mouth. They know there are ways to earn more, but the path from "hearing about it" to "actually doing it" is fragmented, confusing, and feels like more hassle than it's worth.

Portfolio size doesn't matter — the value Tidal provides is in simplification, not scale. Whether someone has $200 or $200,000 in Solana assets, the problem is the same: the gap between having assets and earning with them is too wide.

**What their week looks like today:** They hear about a yield opportunity on Twitter. They visit the protocol's site, try to understand the mechanics, check if it's safe, figure out how to move their assets, compare it against alternatives, and eventually either do it with partial confidence or give up. The whole process is scattered across multiple apps and tabs.

**What their week looks like with Tidal:** They open Tidal, describe what they want in plain language, and get a personalised Pool — a diversified set of positions across trusted DeFi platforms, with clear risk levels and expected returns. They adjust through conversation, deploy, and choose their level of control. Some users stay hands-on — chatting with Tidal to make every decision themselves. Others switch on autonomous mode and let Tidal manage the Pool within the guardrails they've set, checking in when Tidal flags a change. Either way, Tidal keeps watching and the user stays informed.

---

## The Problem

DeFi yield opportunities on Solana are abundant. Lending, liquidity provision, staking, looping — the ecosystem is rich with ways to earn. But for most users, these opportunities are effectively invisible.

The problem isn't that the protocols don't work. It's that **the path from "I have assets" to "I'm earning better returns" is fragmented, confusing, and feels like a hassle.** Opportunities are spread across dozens of apps with no single place to discover, compare, or act on them. Evaluating risk requires expertise most users don't have. And the execution steps — which protocol, which pool, how to move assets safely — are intimidating enough that many people default to just holding.

The result is a large population of Solana users with idle or underutilised assets. They know they could be doing more, but the effort-to-reward ratio of the current workflow doesn't feel worth it. The alternatives — following influencer tips blindly, manually hopping between protocols, or copying whale wallets without understanding why — all carry risks that aren't visible until it's too late.

---

## The Insight

Three things are true at the same time:

**1. DeFi yield opportunities are abundant but invisible to most users.** The Solana ecosystem is full of ways to earn — lending, LPs, staking, looping — but discovering and evaluating them requires visiting dozens of apps and interpreting data that wasn't designed for regular people.

**2. Natural language is the missing interface — and autonomy is the missing mode.** The data and the protocols already exist. What's missing is a layer that lets someone say "I have 10 SOL and I want low-risk yield" and get a clear, personalised answer with a path to act on it. But beyond conversation, users also need the option to let an AI agent manage their positions within defined guardrails — rebalancing, rotating, and optimising without requiring constant manual input. The complexity isn't in the DeFi — it's in the interface between the user and the DeFi, and in the absence of an agent that can act on the user's behalf when they want it to.

**3. On-chain data is now accessible enough to power real-time AI advice.** Services like SolEnrich mean you don't need to build a Solana data pipeline from scratch — you can query wallet profiles, token risk scores, whale signals, and due diligence reports on demand via micropayments. This makes an AI-powered advisor viable in a way it wasn't before.

---

## Value Proposition

**"Earn more on Solana with DeFi powered by AI."**

Tidal doesn't require users to become DeFi experts. It takes what they have, asks what they want, and builds a diversified Pool of positions across trusted Solana platforms — all through natural language conversation.

**vs. Manual protocol hopping (Jupiter, Kamino, Marinade individually):** Tidal finds and recommends opportunities across protocols in one place — no more tabbing between apps and comparing rates.

**vs. Crypto Twitter / influencer tips:** Tidal gives personalised, data-backed recommendations based on the user's actual portfolio and risk tolerance, not generic hype.

**vs. Wallet trackers (Solscan, Nansen):** Those show what's happening on-chain. Tidal tells users what to do about it and helps them act.

**vs. Doing nothing (just holding):** Tidal makes earning yield as easy as asking a question — there's no reason to leave assets idle.

---

## Product Principles

These are ranked. When tradeoffs arise, higher-ranked principles win.

**1. Simplicity is the product.** Natural language in, clear action out. If the user needs to understand how DeFi works under the hood to use Tidal, we've failed. The interface is conversation, not dashboards and dropdowns.

**2. The user is always in control.** Tidal offers a spectrum from fully manual (conversational advisory) to fully autonomous (AI-managed positions), and the user chooses where they sit. Autonomous mode is opt-in, transparent, and reversible. Nothing happens without the user's parameters being respected, and they can switch back to manual at any time.

**3. Built on trust.** Tidal works with established, trusted Solana DeFi platforms and always makes risk visible. Users should trust both the recommendations and the protocols behind them. We never obscure downside. In autonomous mode, every action the agent takes is logged and explained.

**4. Recommendations must earn their keep.** The AI advice needs to be genuinely better than what the user would find scrolling Twitter — data-backed, personalised, and timely. Mediocre suggestions are worse than no suggestions.

**5. Speed to value.** The gap between "I want to earn more" and actually earning should be as short as possible. Every unnecessary step is a failure.

**Willing to sacrifice early:** Multi-chain support is not on the roadmap — Tidal is Solana only, by design. Tidal Amplify (the node-based strategy builder) is the last surface to ship. Visual polish can follow function.

**Not willing to sacrifice:** The natural language interface as the primary interaction model. User control over the manual/autonomous spectrum. Integration with established Solana DeFi platforms (not custom or unknown protocols). Transparent risk communication.

---

## Build Sequence

The three product surfaces ship in order:

**1. Tidal Pool** — the conversational AI advisor. Users describe what they want, Tidal recommends a diversified Pool of positions across trusted DeFi platforms. This is the core product and the first thing to build.

**2. Tidal Swap** — many-to-many token swaps. Users describe a rebalance ("convert my memecoins into a split of SOL and USDC") and Tidal routes it. This extends the platform from advisory to execution.

**3. Tidal Amplify** — the node-based yield strategy builder. For experienced users who want to construct complex, composable DeFi strategies (deposit → borrow → reinvest loops) visually. This is the most advanced surface and ships last.

---

## Validation Status

**What evidence exists:**

- Social signals confirm the pain — the broader Web3 market is clearly moving toward AI-powered simplification of DeFi, with multiple projects and significant discourse around making blockchain interactions accessible through natural language.
- The data infrastructure now exists (SolEnrich, Solana Agent Kit) to make this technically feasible without building from scratch.
- The founder has direct experience with the pain point as a Solana ecosystem participant.

**What assumptions remain untested:**

- Will users trust an AI to recommend DeFi positions with their real assets? The trust barrier is the biggest unknown.
- Is the quality of AI-generated recommendations good enough to be meaningfully better than social signals and manual research?
- Will users deploy capital through Tidal, or use it for discovery but execute elsewhere?
- What's the willingness to pay — and what's the right fee model (subscription, take rate on yield, transaction fee)?
- Can the Pool concept (multi-position, multi-protocol) be explained simply enough that it doesn't reintroduce the complexity Tidal is trying to remove?
- What proportion of users will opt into autonomous mode vs. staying manual? How quickly does trust build — and what triggers the switch?
- What guardrails and constraints do users need to feel safe turning on autonomous management? (e.g., max position size, approved protocols only, stop-loss thresholds)
- How do users want to be notified of autonomous actions — and how much detail do they want?

**Lightest next step:** Build the thinnest possible version of Tidal Pool — a conversational interface that takes a user's described portfolio and risk preference, queries SolEnrich for data, and returns a recommended set of positions across 2–3 established Solana protocols. No execution yet — just the recommendation. Put it in front of 10–15 active Solana users and measure whether the recommendations feel trustworthy, useful, and better than what they'd find on their own.

---

## Key Trends

**From copilot to autopilot.** The AI interaction model is evolving from "ask and receive" to "set parameters and delegate." Users are becoming comfortable with AI agents that act on their behalf — but only when control, transparency, and reversibility are built in. Tidal's manual-to-autonomous spectrum rides this trend directly.

**AI as the universal interface.** The shift from "learn the tool" to "tell the tool what you want" is happening across every domain. In DeFi, where the tools are particularly complex and the stakes are real money, this shift is especially powerful.

**DeFi maturation on Solana.** The Solana DeFi ecosystem has moved past the experimental phase — protocols like Marinade, Kamino, Jupiter, and Raydium are established, trusted, and have significant TVL. This means Tidal can build on a foundation of credible platforms rather than asking users to trust unknown protocols.

**Agent-native data infrastructure.** The emergence of services like SolEnrich (on-chain enrichment via micropayments) and standards like x402 (agent-to-agent payments) means the data layer for AI-powered DeFi products can be assembled rather than built from scratch. The infrastructure cost of building Tidal today is a fraction of what it would have been 18 months ago.

**Yield-seeking behaviour in a maturing market.** As the Solana ecosystem grows, more users are moving beyond pure speculation (memecoins, token trading) and looking for sustainable ways to earn on their holdings. Tidal meets this shift at the right moment.
