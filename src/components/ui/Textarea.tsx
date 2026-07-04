import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border bg-cream-50 px-4 py-3 text-base text-ink-900 placeholder:text-ink-700/40 transition-colors focus:outline-none focus:ring-2 focus:ring-maroon-400/60 focus:border-maroon-400 min-h-24 resize-y",
          error ? "border-red-400" : "border-ink-900/10",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
