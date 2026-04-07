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
        "tidal-pill-button",
        className
      )}
    >
      {children}
    </button>
  );
}
