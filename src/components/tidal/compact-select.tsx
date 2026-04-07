"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type CompactSelectProps = {
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

export function CompactSelect({
  className,
  contentClassName,
  itemClassName,
  options,
  value,
  onChange,
}: CompactSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "nodrag flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-tidal-border bg-tidal-sidebar-active px-2 py-1.5 outline-none",
          className
        )}
      >
        <span className="text-[10px] font-medium text-foreground">{value}</span>
        <svg
          width="7"
          height="4"
          viewBox="0 0 8 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L4 4L7 1"
            stroke="#657F92"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={4}
        className={cn(
          "min-w-[120px] rounded-[4px] border border-tidal-border bg-tidal-card",
          contentClassName
        )}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className={cn("cursor-pointer text-[10px] text-tidal-accent", itemClassName)}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
