import * as React from "react";

import { cn } from "@/shared/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-control w-full rounded-input border border-input bg-card px-4 py-2 text-sm shadow-xs ring-offset-background transition-[background-color,border-color,box-shadow,color] duration-[var(--duration-default)] ease-[var(--ease-clean-default)] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70 aria-invalid:border-danger aria-invalid:ring-danger/30",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
