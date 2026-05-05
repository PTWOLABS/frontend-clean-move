import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils/cn";

const buttonVariants = cva(
  "inline-flex min-w-control items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-semibold shadow-xs ring-offset-background transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--duration-default)] ease-[var(--ease-clean-default)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        outline:
          "border border-input bg-card text-foreground hover:bg-muted hover:text-foreground",
        ghost:
          "bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-danger/90 active:bg-danger",
      },
      size: {
        default: "h-control px-[18px] py-2",
        sm: "h-10 min-w-10 px-4 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-control p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      isLoading = false,
      loadingText,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        aria-busy={isLoading || undefined}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        ) : null}
        {isLoading && loadingText ? loadingText : children}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
