import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "rounded-md p-px transition-colors",
          "bg-input",
          "focus-within:bg-gradient-to-br focus-within:from-blue-600 focus-within:to-purple-600"
        )}
      >
        <textarea
          className={cn(
            "flex min-h-[60px] w-full rounded-[7px] border-0 bg-background px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
