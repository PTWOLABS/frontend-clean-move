"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  navLayout = "around",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: ButtonProps["variant"];
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("group/calendar bg-background p-3", className)}
      captionLayout={captionLayout}
      navLayout={navLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: "w-fit",
        months: "relative flex flex-col gap-3 md:flex-row md:gap-4",
        month: "relative flex w-full flex-col gap-4",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        month_caption: "flex h-8 items-center justify-center px-8",
        caption_label: "text-sm font-medium capitalize",
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "absolute left-0 top-0 h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "absolute right-0 top-0 h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        dropdowns: "flex h-8 items-center justify-center gap-1.5 text-sm font-medium",
        dropdown_root:
          "has-focus:border-ring has-focus:ring-ring/50 relative rounded-md border border-input shadow-xs has-focus:ring-[3px]",
        dropdown: "absolute inset-0 bg-popover opacity-0",
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday:
          "text-muted-foreground flex h-8 w-8 items-center justify-center rounded-md p-0 text-[0.8rem] font-normal",
        weeks: "flex flex-col",
        week: "mt-1 flex w-full",
        week_number_header: "w-8",
        week_number: "text-muted-foreground w-8 text-[0.8rem]",
        day: cn(
          "relative h-8 w-8 p-0 text-center text-sm",
          "[&.range-start]:rounded-l-md [&.range-start]:bg-[linear-gradient(90deg,transparent_50%,hsl(var(--accent-soft))_50%)] [&.range-start>button]:rounded-l-md",
          "[&.range-middle]:bg-accent/5",
          "[&.range-end]:rounded-r-md [&.range-end]:bg-[linear-gradient(90deg,hsl(var(--accent-soft))_50%,transparent_50%)] [&.range-end>button]:rounded-r-md",
          "[&.range-start.range-end]:bg-transparent",
          "[&.range-start>button]:bg-primary [&.range-start>button]:text-primary-foreground [&.range-start>button]:hover:bg-primary [&.range-start>button]:hover:text-primary-foreground [&.range-start>button]:focus:bg-primary [&.range-start>button]:focus:text-primary-foreground",
          "[&.range-end>button]:bg-primary [&.range-end>button]:text-primary-foreground [&.range-end>button]:hover:bg-primary [&.range-end>button]:hover:text-primary-foreground [&.range-end>button]:focus:bg-primary [&.range-end>button]:focus:text-primary-foreground",
          "[&.selected:not(.range-start):not(.range-middle):not(.range-end)>button]:bg-primary [&.selected:not(.range-start):not(.range-middle):not(.range-end)>button]:text-primary-foreground [&.selected:not(.range-start):not(.range-middle):not(.range-end)>button]:hover:bg-primary [&.selected:not(.range-start):not(.range-middle):not(.range-end)>button]:hover:text-primary-foreground [&.selected:not(.range-start):not(.range-middle):not(.range-end)>button]:focus:bg-primary [&.selected:not(.range-start):not(.range-middle):not(.range-end)>button]:focus:text-primary-foreground",
          "[&.range-middle>button]:text-foreground [&.range-middle>button]:hover:bg-transparent [&.range-middle>button]:hover:text-foreground [&.range-middle>button]:focus:bg-transparent [&.range-middle>button]:focus:text-foreground",
          "[&.today:not(.selected)>button]:bg-accent [&.today:not(.selected)>button]:text-accent-foreground",
          "[&.outside]:text-muted-foreground [&.outside]:opacity-50",
          "[&.outside.selected>button]:bg-accent/50 [&.outside.selected>button]:text-muted-foreground [&.outside.selected>button]:opacity-30",
          "focus-within:relative focus-within:z-20",
        ),
        day_button:
          "inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-sm font-normal leading-none transition-colors hover:bg-accent/20 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        range_start: "range-start",
        range_middle: "range-middle",
        range_end: "range-end",
        selected: "selected",
        today: "today",
        outside: "outside",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
          }

          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
          }

          return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
        },
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
