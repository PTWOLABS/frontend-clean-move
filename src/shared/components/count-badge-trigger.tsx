"use client";

import type { ComponentProps, ReactNode } from "react";

import { badgeVariants } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/shared/utils/cn";

type CountBadgeTriggerProps = {
  label?: string;
  count: number;
  ariaLabel: string;
  onClick: () => void;
  className?: string;
  labelClassName?: string;
  countClassName?: string;
  align?: "start" | "end";
  tooltipLabel?: ReactNode;
  tooltipSide?: ComponentProps<typeof TooltipContent>["side"];
};

function CountBadgeButton({
  label,
  count,
  ariaLabel,
  onClick,
  className,
  labelClassName,
  countClassName,
  align = "start",
}: Omit<CountBadgeTriggerProps, "tooltipLabel" | "tooltipSide">) {
  const isEndAligned = align === "end";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "group inline-flex max-w-full cursor-pointer items-center gap-2 rounded-md py-0.5",
        "text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isEndAligned && "ml-auto justify-end text-right",
        className,
      )}
    >
      {label ? (
        <span
          className={cn(
            "min-w-0 truncate text-sm text-foreground transition-colors group-hover:text-primary",
            isEndAligned && "text-right",
            labelClassName,
          )}
        >
          {label}
        </span>
      ) : null}
      <span
        aria-hidden
        className={cn(
          badgeVariants({ variant: "outline" }),
          "h-6 min-w-6 shrink-0 justify-center rounded-full px-2 py-0 text-xs font-semibold tabular-nums",
          "border-border bg-muted/80 text-foreground transition-colors",
          "group-hover:border-primary/45 group-hover:bg-primary/15 group-hover:text-primary",
          countClassName,
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function CountBadgeTrigger({
  tooltipLabel,
  tooltipSide = "top",
  ...props
}: CountBadgeTriggerProps) {
  const trigger = <CountBadgeButton {...props} />;

  if (!tooltipLabel) {
    return trigger;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          side={tooltipSide}
          sideOffset={6}
          className="border border-border bg-popover text-popover-foreground shadow-md"
        >
          {tooltipLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
