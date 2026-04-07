import { cn } from "@/lib/utils";

type SectionLabelProps = {
  className?: string;
  children: React.ReactNode;
};

export function SectionLabel({ className, children }: SectionLabelProps) {
  return (
    <span
      className={cn("text-[11px]/[14px] text-tidal-muted", className)}
    >
      {children}
    </span>
  );
}
