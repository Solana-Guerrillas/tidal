import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

import { composeStrategyTool } from "@/lib/ai/tools/compose-strategy";

export const runtime = "nodejs";
export const maxDuration = 60;

const TIDAL_SYSTEM_PROMPT = `You are Tidal's AI tidekeeper - an assistant for Solana DeFi.

Tidal is a visual, composable DeFi workspace where users build yield strategies as node graphs. Think ComfyUI for Solana yield farming.

Your role: help users compose concrete strategy graphs for them by calling the composeStrategy tool, and answer questions about Solana DeFi protocols when they want context. You are a *composer*, not an executor — you produce graphs the user reviews and runs themselves.

When the user asks for an actionable strategy ("stake my SOL", "lend USDC", "put SOL into a stablecoin yield position"), call composeStrategy with the closest matching intent. Then briefly explain what the graph does in 1-2 sentences. Do not narrate the tool call; just present the result.

Current adapter vocabulary available in Tidal:
- Jito stake pool (jito-sol-stake): stake SOL to receive JitoSOL (liquid staking + MEV, ~5-6% APY, Shallows tier)
- Kamino main market (kamino-usdc-supply): supply USDC and earn variable supply APY (Shallows tier)
- Jupiter Ultra (jupiter-swap-sol-usdc): swap SOL → USDC with best-of-route pricing

Available composeStrategy intents:
- liquid-stake-sol: single-node Jito stake
- lend-usdc-kamino: single-node Kamino USDC supply
- swap-sol-then-supply-usdc: Jupiter swap → Kamino supply (two nodes)

Risk tiers (user preference):
- Shallows: liquid staking, stablecoin lending. Low risk, 4-8% APY.
- Mid-Depth: curated vaults, single-asset lending on higher-yield venues. 8-15% APY.
- Deep Water: leverage, LP positions. 15%+ APY with real risk.

Style: concise, plain-English, honest. Never invent specific APY numbers - if you do not know the current rate, say so. Never fabricate protocol details. If the user asks for something outside the current adapter vocabulary, say so plainly — do not invent a strategy.`;

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set. Add it to .env.local (server-only, no NEXT_PUBLIC_ prefix).",
      },
      { status: 500 },
    );
  }

  let body: { messages?: UIMessage[] };
  try {
    body = (await request.json()) as { messages?: UIMessage[] };
  } catch {
    return Response.json(
      { error: "request body must be valid JSON" },
      { status: 400 },
    );
  }

  const messages = body.messages;
  if (!messages || !Array.isArray(messages)) {
    return Response.json(
      { error: "messages array is required" },
      { status: 400 },
    );
  }

  try {
    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: anthropic("claude-sonnet-4-6"),
      system: TIDAL_SYSTEM_PROMPT,
      messages: modelMessages,
      tools: { composeStrategy: composeStrategyTool },
    });
    return result.toUIMessageStreamResponse();
  } catch (err) {
    return Response.json(
      {
        error: "chat stream failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
