import * as React from "react";

import { cn } from "@/shared/utils/cn";
import {
  SelectContent,
  SelectItem,
  Select as SelectPrimitive,
  SelectTrigger,
  SelectValue,
} from "./primitives";

type SelectTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof SelectTrigger>,
  "children" | "value" | "onChange"
>;

type SelectOption<TValue extends string> = {
  label: string;
  value: TValue;
  disabled?: boolean;
};

type SelectProps<TValue extends string> = SelectTriggerProps & {
  value?: TValue;
  onChange: (value: TValue) => void;
  options: SelectOption<TValue>[];
  placeholder?: string;
};

const SelectBase = React.forwardRef(
  <TValue extends string>(
    { value, onChange, options, placeholder, className, ...triggerProps }: SelectProps<TValue>,
    ref: React.ForwardedRef<React.ComponentRef<typeof SelectTrigger>>,
  ) => {
    return (
      <SelectPrimitive value={value} onValueChange={(nextValue) => onChange(nextValue as TValue)}>
        <SelectTrigger ref={ref} className={cn("w-full", className)} {...triggerProps}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPrimitive>
    );
  },
);

SelectBase.displayName = "Select";

const Select = SelectBase as <TValue extends string>(
  props: SelectProps<TValue> & React.RefAttributes<React.ComponentRef<typeof SelectTrigger>>,
) => React.ReactElement;

export { Select };
