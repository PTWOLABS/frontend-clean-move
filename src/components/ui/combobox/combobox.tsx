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
import { OptionsLoadMoreButton } from "@/components/ui/options-load-more-button";
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
  onSelectedItemChange?: (item: ComboboxItemOption | null) => void;
  onValueChange?: (value: string) => void;
  portalContainer?: React.ComponentProps<typeof ComboboxContent>["portalContainer"];
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
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
      onSelectedItemChange,
      onValueChange,
      portalContainer,
      showClear = true,
      hasMore = false,
      onLoadMore,
      isLoadingMore = false,
      ...props
    },
    ref,
  ) => {
    const selectedItem = items.find((item) => item.value === value || item.label === value) ?? null;
    const debouncedValue = useDebouncedValue(value, debounceMs);
    const selectedLabelPendingDebounceRef = React.useRef<string | null>(null);

    React.useEffect(() => {
      if (selectedLabelPendingDebounceRef.current === debouncedValue) {
        selectedLabelPendingDebounceRef.current = null;
        return;
      }

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
        onInputValueChange={(nextValue, eventDetails) => {
          if (eventDetails.reason === "item-press") {
            return;
          }

          onValueChange?.(nextValue);
          onSelectedItemChange?.(null);
        }}
        onValueChange={(item) => {
          selectedLabelPendingDebounceRef.current = item?.label ?? null;
          onValueChange?.(item?.label ?? "");
          onSelectedItemChange?.(item);
        }}
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
        <ComboboxContent portalContainer={portalContainer}>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          {hasMore && onLoadMore ? (
            <OptionsLoadMoreButton onLoadMore={onLoadMore} isLoadingMore={isLoadingMore} />
          ) : null}
        </ComboboxContent>
      </ComboboxPrimitive>
    );
  },
);
Combobox.displayName = "Combobox";
