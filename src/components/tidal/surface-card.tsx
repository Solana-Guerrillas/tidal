import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfaceCardVariants = cva(
  "border border-tidal-border bg-tidal-card",
  {
    variants: {
      tone: {
        default: "shadow-lg shadow-black/20",
        muted: "border-tidal-border/60 bg-tidal-card/80 shadow-md shadow-black/20",
      },
      radius: {
        md: "rounded-[10px]",
        lg: "rounded-lg",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-4",
      },
    },
    defaultVariants: {
      tone: "default",
      radius: "lg",
      padding: "md",
    },
  }
);

type SurfaceCardProps = {
  className?: string;
  children: React.ReactNode;
} & VariantProps<typeof surfaceCardVariants>;

export function SurfaceCard({
  children,
  className,
  padding,
  radius,
  tone,
}: SurfaceCardProps) {
  return (
    <div className={cn(surfaceCardVariants({ tone, radius, padding }), className)}>
      {children}
    </div>
  );
}
