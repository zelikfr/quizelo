import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border-0 font-display font-semibold uppercase tracking-[0.01em] no-underline select-none transition-all duration-120 cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "text-white bg-gradient-violet shadow-btn-violet hover:-translate-y-px hover:shadow-btn-violet-hover",
        gold:
          "text-[#1A1430] bg-gradient-gold shadow-btn-gold hover:-translate-y-px hover:shadow-btn-gold-hover",
        ghost:
          "text-fg-1 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.16]",
      },
      size: {
        sm:   "px-4 py-2 text-xs",
        md:   "px-6 py-3.5 text-sm",
        lg:   "px-8 py-4 text-sm",
        full: "w-full px-4 py-3.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, asChild = false, ...props }, ref) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

export { buttonVariants };
