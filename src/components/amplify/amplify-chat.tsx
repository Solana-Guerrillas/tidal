"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const suggestions = [
  "Optimise this strategy",
  "Add a new node",
  "Show risk breakdown",
];

const modes = ["Chat", "Pool", "Swap", "Amplify"] as const;

type Message = {
  role: "ai" | "user";
  content: string;
};

const mockedMessages: Message[] = [
  {
    role: "ai",
    content:
      "Welcome to Tidal Amplify. I can help you build and optimise yield strategies across Solana protocols.",
  },
  {
    role: "ai",
    content:
      "This strategy stakes SOL through Marinade, borrows USDC on Kamino, and provides liquidity on Raydium for a net estimated yield of ~16.3%.",
  },
  {
    role: "user",
    content:
      "Can you help me improve the yield on this loop? I'd like to explore alternatives to Raydium for the liquidity step.",
  },
];

export function AmplifyChat() {
  const [mode, setMode] = useState<(typeof modes)[number]>("Amplify");

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-[27px] px-[43px] pb-5">
        {/* AI messages */}
        <div className="flex flex-col gap-2">
          {mockedMessages
            .filter((m) => m.role === "ai")
            .map((message, i) => (
              <p key={i} className="text-[13px]/[20px] text-tidal-muted">
                {message.content}
              </p>
            ))}
        </div>

        {/* Suggestions */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px]/[14px] text-tidal-muted">
            Suggestions
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="cursor-pointer rounded-[4px] border border-tidal-accent/50 bg-tidal-card px-3 py-1.5 text-[11px]/[14px] font-medium text-tidal-accent"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        {/* User message */}
        {mockedMessages
          .filter((m) => m.role === "user")
          .map((message, i) => (
            <div key={i} className="flex justify-end">
              <div className="rounded-[10px] border border-tidal-border bg-tidal-card p-5">
                <p className="text-[13px]/[20px] font-medium text-tidal-muted">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* Input area */}
      <div className="flex shrink-0 flex-col items-center gap-3 px-[43px] pt-5">
        <div className="flex w-full items-center justify-between rounded-full border border-tidal-border bg-tidal-card px-[17px] py-[9px]">
          <Input
            placeholder="Message Tidal"
            className="h-auto border-0 bg-transparent p-0 text-[13px]/[16px] font-medium text-foreground placeholder:text-tidal-placeholder focus-visible:ring-0"
          />
          <div className="flex shrink-0 items-center gap-3">
            {/* Mode dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-[90px] cursor-pointer items-center justify-between gap-1.5 rounded-[4px] border border-tidal-accent/50 px-2 py-1.5 outline-none">
                <span className="text-[11px]/[14px] font-medium text-tidal-accent">
                  {mode}
                </span>
                <svg
                  width="8"
                  height="5"
                  viewBox="0 0 8 5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L4 4L7 1"
                    stroke="#61B3CF"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="top"
                sideOffset={8}
                className="min-w-[120px] rounded-[4px] border border-tidal-border bg-tidal-card"
              >
                {modes.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => setMode(option)}
                    className="cursor-pointer text-[11px]/[14px] text-tidal-accent"
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Send button */}
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-tidal-accent">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 1V13M7 1L3 5M7 1L11 5"
                  stroke="#030813"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <span className="text-center text-[11px]/[14px] font-medium text-tidal-placeholder">
          Tidal will ask for approval before executing any transactions
        </span>
      </div>
    </div>
  );
}
