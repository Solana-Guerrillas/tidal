import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium",
  {
    variants: {
      variant: {
        status: "bg-tidal-accent/10 text-tidal-accent",
        token: "rounded bg-tidal-sidebar-active text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 tidal-text-caption",
        xs: "px-1.5 py-0.5 tidal-text-caption",
      },
    },
    defaultVariants: {
      variant: "status",
      size: "sm",
    },
  }
);

type BadgeProps = {
  className?: string;
  children: React.ReactNode;
};

export function Badge({
  children,
  className,
  size,
  variant,
}: BadgeProps & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, size }), className)}>{children}</span>;
}
