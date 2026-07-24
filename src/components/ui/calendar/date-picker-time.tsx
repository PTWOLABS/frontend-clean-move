"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/shared/utils/cn";
import { getValidDate } from "@/shared/utils/lib";

type DatePickerTimeProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  value?: Date | string | number | null;
  onChange?: (value: Date | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  dateButtonId?: string;
  timeInputId?: string;
  timeInputAriaLabel?: string;
  timeInputClassName?: string;
  portalContainer?: React.ComponentProps<typeof PopoverContent>["portalContainer"];
  side?: "bottom" | "top" | "left" | "right";
};

function formatTimeValue(date: Date | undefined) {
  return date ? format(date, "HH:mm") : "";
}

function mergeDateAndTime(date: Date, timeValue: string) {
  const [hours = "0", minutes = "0"] = timeValue.split(":");
  const nextDate = new Date(date);

  nextDate.setHours(Number(hours), Number(minutes), 0, 0);

  return nextDate;
}

export const DatePickerTime = React.forwardRef<HTMLDivElement, DatePickerTimeProps>(
  (
    {
      className,
      value,
      onChange,
      onBlur,
      placeholder = "Selecione data e horário",
      disabled = false,
      invalid = false,
      dateButtonId,
      timeInputId,
      timeInputAriaLabel = "Horário",
      timeInputClassName,
      portalContainer,
      side = "bottom",
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const selectedDate = getValidDate(value);
    const [timeValue, setTimeValue] = React.useState(formatTimeValue(selectedDate));

    React.useEffect(() => {
      setTimeValue(formatTimeValue(selectedDate));
    }, [selectedDate]);

    return (
      <div
        ref={ref}
        className={cn("grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2", className)}
        {...props}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={dateButtonId}
              type="button"
              variant="outline"
              disabled={disabled}
              aria-describedby={ariaDescribedBy}
              className={cn(
                "h-10 w-full min-w-0 justify-start overflow-hidden rounded-md border-border/80 bg-background/40 px-3 text-left font-normal shadow-sm hover:bg-muted/40",
                !selectedDate && "text-muted-foreground",
                invalid && "border-destructive/70 focus-visible:ring-destructive/30",
              )}
              onBlur={onBlur}
            >
              <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="block min-w-0 flex-1 truncate">
                {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side={side}
            align="start"
            portalContainer={portalContainer}
            className="w-auto rounded-xl border-border/80 p-0"
          >
            <Calendar
              mode="single"
              locale={ptBR}
              selected={selectedDate}
              defaultMonth={selectedDate}
              onSelect={(date) => {
                onChange?.(date ? mergeDateAndTime(date, timeValue) : null);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <Input
          id={timeInputId}
          type="time"
          value={timeValue}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-label={timeInputAriaLabel}
          step="60"
          className={cn(
            "h-10 w-28 shrink-0 border-border/80 bg-background/40 shadow-sm",
            invalid && "border-destructive/70 focus-visible:ring-destructive/30",
            "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
            timeInputClassName,
          )}
          onChange={(event) => {
            const nextTime = event.target.value;

            setTimeValue(nextTime);

            if (selectedDate) {
              onChange?.(mergeDateAndTime(selectedDate, nextTime));
            }
          }}
          onBlur={onBlur}
        />
      </div>
    );
  },
);
DatePickerTime.displayName = "DatePickerTime";
