"use client";

import * as React from "react";

import {
  Combobox as ComboboxPrimitive,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./primitives";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { cn } from "@/shared/utils/cn";

export type ComboboxItemOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type ComboboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof ComboboxInput>,
  "children" | "defaultValue" | "onChange" | "value"
> & {
  items: ComboboxItemOption[];
  value?: string;
  debounceMs?: number;
  emptyMessage?: React.ReactNode;
  onDebouncedValueChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
};

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      items,
      value = "",
      debounceMs = 300,
      emptyMessage = "Nenhum item encontrado.",
      placeholder = "Selecione uma opção",
      className,
      onDebouncedValueChange,
      onValueChange,
      showClear = true,
      ...props
    },
    ref,
  ) => {
    const selectedItem = items.find((item) => item.value === value || item.label === value) ?? null;
    const debouncedValue = useDebouncedValue(value, debounceMs);

    React.useEffect(() => {
      onDebouncedValueChange?.(debouncedValue);
    }, [debouncedValue, onDebouncedValueChange]);

    return (
      <ComboboxPrimitive
        items={items}
        value={selectedItem}
        inputValue={value}
        itemToStringLabel={(item) => item.label}
        itemToStringValue={(item) => item.value}
        isItemEqualToValue={(item, selectedValue) => item.value === selectedValue.value}
        onInputValueChange={(nextValue) => onValueChange?.(nextValue)}
        onValueChange={(item) => onValueChange?.(item?.label ?? "")}
      >
        <ComboboxInput
          ref={ref}
          placeholder={placeholder}
          showClear={showClear}
          className={cn(
            "border-border/80 bg-background/40 shadow-sm dark:bg-background/40",
            className,
          )}
          {...props}
        />
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </ComboboxPrimitive>
    );
  },
);
Combobox.displayName = "Combobox";
