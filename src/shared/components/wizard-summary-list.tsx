import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";

export type WizardSummaryItem = {
  label: string;
  value: string;
  completed: boolean;
  icon: LucideIcon;
};

type WizardSummaryListProps = {
  items: WizardSummaryItem[];
  compact?: boolean;
  className?: string;
};

export function getWizardSummaryValue(value: string, emptyLabel = "não informado") {
  if (value.toLocaleLowerCase("pt-BR").includes(emptyLabel)) {
    return emptyLabel;
  }

  return value;
}

export function WizardSummaryList({ items, compact = false, className }: WizardSummaryListProps) {
  return (
    <dl
      className={cn(
        "divide-y divide-border/60 rounded-xl border border-border/70 bg-background/40",
        className,
      )}
    >
      {items.map((item) => (
        <WizardSummaryRow key={item.label} item={item} compact={compact} />
      ))}
    </dl>
  );
}

export function WizardProgressBadge({ progress }: { progress: number }) {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex size-14 shrink-0 items-center justify-center"
      aria-label={`${progress}% concluído`}
    >
      <svg aria-hidden className="absolute inset-0 size-14 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      <span className="text-xs font-bold tabular-nums text-foreground">{progress}%</span>
    </div>
  );
}

function WizardSummaryRow({ item, compact }: { item: WizardSummaryItem; compact: boolean }) {
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
        compact ? "px-3 py-2.5" : "px-4 py-3",
      )}
    >
      <dt
        className={cn(
          "flex min-w-0 items-center font-medium text-muted-foreground",
          compact ? "gap-2 text-xs" : "gap-3 text-sm",
        )}
      >
        <Icon aria-hidden className={cn("shrink-0", compact ? "size-3.5" : "size-4")} />
        <span className="truncate">{item.label}</span>
      </dt>

      <dd
        className={cn(
          "flex min-w-0 items-center gap-2 text-right font-medium text-foreground",
          compact ? "text-xs" : "text-sm",
        )}
      >
        <span className={cn("truncate", compact ? "max-w-28" : "max-w-32")}>{item.value}</span>
        <span
          aria-hidden
          className={cn(
            "shrink-0 rounded-full ring-2",
            compact ? "size-2" : "size-2.5",
            item.completed
              ? "bg-primary ring-primary/25"
              : "bg-transparent ring-muted-foreground/35",
          )}
        />
      </dd>
    </div>
  );
}
