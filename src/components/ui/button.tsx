import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:scale-[1.02] focus-visible:shadow-[0_0_20px_rgba(10,132,255,0.4)] focus-visible:ring-[2px] focus-visible:ring-accent-focus active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: 
          "bg-gradient-to-b from-accent-primary to-accent-focus text-text-primary shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/30 hover:brightness-110",
        destructive:
          "bg-gradient-to-b from-state-error to-[#CC3630] text-text-primary shadow-lg shadow-state-error/20 hover:shadow-state-error/30 hover:brightness-110 focus-visible:shadow-[0_0_20px_rgba(255,69,58,0.4)] focus-visible:ring-state-error",
        outline:
          "border border-border-subtle bg-background-tertiary/50 backdrop-blur-xl text-text-primary hover:bg-background-tertiary hover:border-accent-primary/50",
        secondary:
          "bg-background-secondary border border-border-subtle text-text-primary hover:bg-background-tertiary",
        ghost:
          "text-text-primary hover:bg-background-tertiary/70",
        link: "text-accent-primary underline-offset-4 hover:underline hover:text-accent-focus",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-7 has-[>svg]:px-5",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };