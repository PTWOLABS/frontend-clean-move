"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/shared/utils/cn";
import { handleNumericInputChange } from "@/shared/utils/lib";

type BrlMoneyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "inputMode" | "autoComplete" | "onChange" | "value"
> & {
  value: string;
  onChange: (value: string) => void;
};

export const BrlMoneyInput = React.forwardRef<HTMLInputElement, BrlMoneyInputProps>(
  ({ value, onChange, className, placeholder = "0,00", onBlur, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        className={cn("tabular-nums", className)}
        value={value}
        onChange={(event) =>
          handleNumericInputChange(event, onChange, {
            formatAsCurrency: true,
            showCurrencySymbol: false,
          })
        }
        onBlur={onBlur}
        {...props}
      />
    );
  },
);

BrlMoneyInput.displayName = "BrlMoneyInput";
