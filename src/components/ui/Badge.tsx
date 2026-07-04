import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        maroon: "bg-maroon-100 text-maroon-700",
        gold: "bg-gold-100 text-gold-600",
        outline: "border border-ink-900/10 text-ink-700 bg-white",
        success: "bg-emerald-100 text-emerald-700",
      },
    },
    defaultVariants: { variant: "maroon" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
