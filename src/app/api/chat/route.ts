import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const TIDAL_SYSTEM_PROMPT = `You are Tidal's AI tidekeeper - an assistant for Solana DeFi.

Tidal is a visual, composable DeFi workspace where users build yield strategies as node graphs. Think ComfyUI for Solana yield farming.

Your role: help users understand their options and (in later versions) compose strategy graphs for them by calling tools. For now, answer questions about Solana DeFi protocols and concepts clearly.

Current adapter vocabulary available in Tidal:
- Jito stake pool: stake SOL to receive JitoSOL (liquid staking + MEV, ~5-6% APY, Shallows tier)
- Kamino main market: supply USDC and earn variable supply APY (Shallows tier)
- Jupiter Ultra: swap between SPL tokens with best-of-route pricing

Risk tiers (user preference):
- Shallows: liquid staking, stablecoin lending. Low risk, 4-8% APY.
- Mid-Depth: curated vaults, single-asset lending on higher-yield venues. 8-15% APY.
- Deep Water: leverage, LP positions. 15%+ APY with real risk.

Style: concise, plain-English, honest. Never invent specific APY numbers - if you do not know the current rate, say so. Never fabricate protocol details.`;

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
