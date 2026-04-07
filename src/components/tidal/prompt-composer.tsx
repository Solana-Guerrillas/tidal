"use client";

import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appModes, type AppMode } from "@/mock-data/shell/types";

const promptComposerVariants = cva(
  "flex items-center justify-between border border-tidal-border bg-tidal-card",
  {
    variants: {
      surface: {
        default: "w-full rounded-lg px-3 py-2",
        pill: "w-full rounded-full px-4 py-2",
      },
    },
    defaultVariants: {
      surface: "default",
    },
  }
);

const promptComposerSendButtonVariants = cva(
  "flex h-8 w-8 items-center justify-center bg-tidal-accent",
  {
    variants: {
      surface: {
        default: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      surface: "default",
    },
  }
);

export type PromptComposerProps = {
  className?: string;
  inputClassName?: string;
  modeTriggerClassName?: string;
  sendButtonClassName?: string;
  showModeSelector?: boolean;
  mode?: AppMode;
  defaultMode?: AppMode;
  onModeChange?: (mode: AppMode) => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  modes?: readonly AppMode[];
  onSubmit?: () => void;
} & VariantProps<typeof promptComposerVariants>;

export function PromptComposer({
  className,
  inputClassName,
  modeTriggerClassName,
  sendButtonClassName,
  showModeSelector = true,
  mode,
  defaultMode = "Chat",
  onModeChange,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Message Tidal",
  modes = appModes,
  onSubmit,
  surface,
}: PromptComposerProps) {
  const [uncontrolledMode, setUncontrolledMode] = useState<AppMode>(defaultMode);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const currentMode = mode ?? uncontrolledMode;
  const currentValue = value ?? uncontrolledValue;

  const handleModeChange = (nextMode: AppMode) => {
    if (mode === undefined) {
      setUncontrolledMode(nextMode);
    }
    onModeChange?.(nextMode);
  };

  const handleValueChange = (nextValue: string) => {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <form
      className={cn(promptComposerVariants({ surface }), className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Input
        value={currentValue}
        onChange={(event) => handleValueChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "tidal-text-body h-auto border-0 bg-transparent p-0 placeholder:text-tidal-placeholder focus-visible:ring-0 dark:bg-transparent",
          inputClassName
        )}
      />
      <div className="flex shrink-0 items-center gap-2">
        {showModeSelector ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "tidal-compact-control w-[90px] gap-1.5 border-tidal-accent/50",
                modeTriggerClassName
              )}
            >
              <span className="tidal-text-action">
                {currentMode}
              </span>
              <svg
                className="text-tidal-accent"
                width="8"
                height="5"
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
              align="end"
              side="top"
              sideOffset={8}
              className="min-w-[120px] rounded-md border border-tidal-border bg-tidal-card"
            >
              {modes.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => handleModeChange(option)}
                  className="cursor-pointer tidal-text-action"
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <button
          type="submit"
          className={cn(
            promptComposerSendButtonVariants({ surface }),
            sendButtonClassName
          )}
        >
          <svg
            className="text-tidal-card"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
