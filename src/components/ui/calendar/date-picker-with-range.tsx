"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/shared/utils/cn";

type DatePickerWithRangeProps = {
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
  align?: "start" | "center" | "end";
  disabled?: boolean;
};

function getDefaultDateRange(): DateRange {
  const today = new Date();

  return {
    from: addDays(today, -6),
    to: today,
  };
}

function formatDateRange(dateRange: DateRange | undefined, placeholder: string) {
  if (!dateRange?.from) {
    return placeholder;
  }

  if (!dateRange.to) {
    return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
  }

  return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
}

export function DatePickerWithRange({
  value,
  onChange,
  className,
  placeholder = "Selecione um período",
  align = "end",
  disabled = false,
}: DatePickerWithRangeProps) {
  const [internalValue, setInternalValue] = React.useState<DateRange | undefined>(
    getDefaultDateRange,
  );

  const selectedRange = value ?? internalValue;

  function handleSelect(nextValue: DateRange | undefined) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-md border-border/80 bg-card/70 px-3 text-left font-normal text-card-foreground shadow-xs backdrop-blur-sm hover:bg-muted/50 disabled:cursor-default disabled:opacity-100 disabled:hover:bg-card/70 md:w-auto md:min-w-80",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarIcon
              aria-hidden="true"
              className={cn("size-4 text-muted-foreground", disabled && "opacity-70")}
            />
            <span className={cn("truncate text-sm", disabled && "text-muted-foreground")}>
              {formatDateRange(selectedRange, placeholder)}
            </span>
          </span>

          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 text-muted-foreground", disabled && "opacity-50")}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-auto rounded-xl border-border/80 p-0"
        onOpenAutoFocus={(event) => {
          if (disabled) {
            event.preventDefault();
          }
        }}
      >
        <Calendar
          mode="range"
          locale={ptBR}
          defaultMonth={selectedRange?.from}
          selected={selectedRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
