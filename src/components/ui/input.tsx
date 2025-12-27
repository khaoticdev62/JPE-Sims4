import * as React from "react";

import { cn } from "./utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "flex h-11 w-full min-w-0 rounded-lg border border-border-subtle bg-background-primary/80 backdrop-blur-sm px-4 py-2.5 transition-all duration-200 outline-none",
          "text-text-primary placeholder:text-text-secondary",
          "focus-visible:border-accent-primary focus-visible:shadow-[0_0_16px_rgba(10,132,255,0.25)] focus-visible:ring-[2px] focus-visible:ring-accent-focus/30 focus-visible:scale-[1.01]",
          "hover:border-accent-primary/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-background-tertiary/30",
          "aria-invalid:border-state-error aria-invalid:focus-visible:shadow-[0_0_16px_rgba(255,69,58,0.25)] aria-invalid:focus-visible:ring-state-error/30",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-text-primary",
          "selection:bg-accent-primary selection:text-text-primary",
          className,
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };