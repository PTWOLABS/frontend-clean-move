"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select/select";
import { cn } from "@/shared/utils/cn";

type SearchSelectInputOption<TValue extends string> = {
  label: string;
  value: TValue;
  disabled?: boolean;
};

type SearchSelectInputProps<TSelectValue extends string> = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "onChange" | "type" | "value"
> & {
  value: string;
  onChange: (value: string) => void;
  selectValue: TSelectValue;
  onSelectChange: (value: TSelectValue) => void;
  options: SearchSelectInputOption<TSelectValue>[];
  selectAriaLabel: string;
  selectPlaceholder?: string;
  rootClassName?: string;
  inputClassName?: string;
  selectClassName?: string;
  buttonClassName?: string;
  searchButtonLabel?: string;
  onSearchClick?: () => void;
};

const SearchSelectInputBase = React.forwardRef(
  <TSelectValue extends string>(
    {
      className,
      disabled,
      inputClassName,
      buttonClassName,
      onChange,
      onSearchClick,
      onSelectChange,
      options,
      rootClassName,
      searchButtonLabel = "Buscar",
      selectAriaLabel,
      selectClassName,
      selectPlaceholder,
      selectValue,
      value,
      ...inputProps
    }: SearchSelectInputProps<TSelectValue>,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <div
        className={cn(
          "flex h-11 w-full min-w-0 items-center overflow-hidden rounded-full border border-border/80 bg-background/60 shadow-xs transition-[border-color,box-shadow] focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/15",
          rootClassName,
          className,
        )}
      >
        <Input
          ref={ref}
          type="search"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 md:text-sm",
            inputClassName,
          )}
          {...inputProps}
        />
        <span aria-hidden className="h-6 w-px shrink-0 bg-border/70" />
        <Select
          value={selectValue}
          onChange={onSelectChange}
          options={options}
          placeholder={selectPlaceholder}
          aria-label={selectAriaLabel}
          disabled={disabled}
          className={cn(
            "h-full w-[30%] shrink-0 rounded-none border-0 bg-transparent px-3 shadow-none focus:ring-0 sm:w-40",
            selectClassName,
          )}
        />
        <Button
          type="button"
          size="icon"
          className={cn("mr-1 size-9 shrink-0 rounded-full shadow-sm", buttonClassName)}
          disabled={disabled}
          aria-label={searchButtonLabel}
          onClick={onSearchClick}
        >
          <Search aria-hidden />
        </Button>
      </div>
    );
  },
);

SearchSelectInputBase.displayName = "SearchSelectInput";

const SearchSelectInput = SearchSelectInputBase as <TSelectValue extends string>(
  props: SearchSelectInputProps<TSelectValue> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement;

export { SearchSelectInput };
export type { SearchSelectInputOption, SearchSelectInputProps };
