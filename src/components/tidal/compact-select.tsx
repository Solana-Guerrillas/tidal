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
};

type CompactSelectValueProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

export function CompactSelect<T extends string>({
  className,
  contentClassName,
  itemClassName,
  options,
  value,
  onChange,
}: CompactSelectProps & CompactSelectValueProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "tidal-compact-control nodrag w-full",
          className
        )}
      >
        <span className="tidal-compact-control-text">{value}</span>
        <svg
          className="text-tidal-muted"
          width="7"
          height="4"
          viewBox="0 0 8 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L4 4L7 1"
            stroke="currentColor"
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
          "min-w-[120px] rounded-md border border-tidal-border bg-tidal-card",
          contentClassName
        )}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "cursor-pointer tidal-text-caption text-tidal-accent",
              itemClassName
            )}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
