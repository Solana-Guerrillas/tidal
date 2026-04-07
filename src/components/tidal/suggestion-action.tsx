"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const suggestionActionVariants = cva(
  "group inline-flex items-center text-left transition-colors outline-none",
  {
    variants: {
      variant: {
        row: "w-full justify-between overflow-hidden rounded-full border border-tidal-border bg-tidal-card py-2 pl-3 pr-2 text-[11px]/[14px] text-tidal-accent hover:border-tidal-accent/40",
        chip: "rounded-[4px] border border-tidal-accent/50 bg-tidal-card px-3 py-1.5 text-[11px]/[14px] font-medium text-tidal-accent hover:border-tidal-accent hover:bg-tidal-sidebar-active",
      },
    },
    defaultVariants: {
      variant: "chip",
    },
  }
);

type SuggestionActionProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
} & VariantProps<typeof suggestionActionVariants>;

export function SuggestionAction({
  children,
  className,
  onClick,
  variant,
}: SuggestionActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(suggestionActionVariants({ variant }), className)}
    >
      <span>{children}</span>
      {variant === "row" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#61B3CF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform group-hover:translate-x-0.5"
        >
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      ) : null}
    </button>
  );
}
