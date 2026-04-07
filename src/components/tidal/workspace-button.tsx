import { cn } from "@/lib/utils";

type WorkspaceButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export function WorkspaceButton({
  className,
  children,
}: WorkspaceButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center rounded-full border border-tidal-border bg-tidal-card px-[17px] py-[9px] text-[11px]/[14px] font-medium text-tidal-accent transition-colors hover:border-tidal-accent/40",
        className
      )}
    >
      {children}
    </button>
  );
}
