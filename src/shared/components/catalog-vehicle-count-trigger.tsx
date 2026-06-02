"use client";

import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

type CatalogVehicleCountTriggerProps = {
  label: string;
  count: number;
  ariaLabel: string;
  onClick: () => void;
  className?: string;
  align?: "start" | "end";
};

export function CatalogVehicleCountTrigger({
  label,
  count,
  ariaLabel,
  onClick,
  className,
  align = "start",
}: CatalogVehicleCountTriggerProps) {
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
      <span
        className={cn(
          "min-w-0 truncate text-sm text-foreground transition-colors group-hover:text-primary",
          isEndAligned && "text-right",
        )}
      >
        {label}
      </span>
      <span
        aria-hidden
        className={cn(
          badgeVariants({ variant: "outline" }),
          "h-6 min-w-6 shrink-0 justify-center rounded-full px-2 py-0 text-xs font-semibold tabular-nums",
          "border-border bg-muted/80 text-foreground transition-colors",
          "group-hover:border-primary/45 group-hover:bg-primary/15 group-hover:text-primary",
        )}
      >
        {count}
      </span>
    </button>
  );
}
