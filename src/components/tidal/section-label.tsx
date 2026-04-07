import { cn } from "@/lib/utils";

type SectionLabelProps = {
  className?: string;
  children: React.ReactNode;
};

export function SectionLabel({ className, children }: SectionLabelProps) {
  return (
    <span
      className={cn("tidal-text-label", className)}
    >
      {children}
    </span>
  );
}
