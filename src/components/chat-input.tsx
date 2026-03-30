"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const modes = ["Chat", "Pool", "Swap", "Amplify"] as const;

export function ChatInput() {
  const [mode, setMode] = useState<(typeof modes)[number]>("Chat");

  return (
    <div className="flex w-1/2 items-center justify-between rounded-lg border border-tidal-border bg-tidal-card px-[10px] py-[9px] pl-3">
      <Input
        placeholder="Message Tidal"
        className="h-auto border-0 bg-transparent p-0 text-[13px]/[16px] font-medium text-foreground placeholder:text-tidal-placeholder focus-visible:ring-0"
      />
      <div className="flex shrink-0 items-center gap-2">
        {/* Mode dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-[90px] items-center justify-between gap-1.5 rounded-[4px] border border-tidal-accent/50 px-2 py-1.5 cursor-pointer outline-none">
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
            className="min-w-[120px] bg-tidal-card border border-tidal-border rounded-[4px]"
          >
            {modes.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => setMode(option)}
                className="text-[11px]/[14px] text-tidal-accent cursor-pointer"
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Send button */}
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-tidal-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0F151F"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
