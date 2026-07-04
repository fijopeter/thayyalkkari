import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border bg-cream-50 px-4 text-base text-ink-900 placeholder:text-ink-700/40 transition-colors focus:outline-none focus:ring-2 focus:ring-maroon-400/60 focus:border-maroon-400",
          error ? "border-red-400" : "border-ink-900/10",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
