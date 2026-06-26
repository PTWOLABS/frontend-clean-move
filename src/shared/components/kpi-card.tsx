import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";

export type KpiCardTone = "neutral" | "info" | "success" | "warning" | "danger";

export type KpiCardItem = {
  id: string;
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  description?: ReactNode;
  tone?: KpiCardTone;
};

const toneClassNames: Record<
  KpiCardTone,
  {
    accent: string;
    icon: string;
    value: string;
  }
> = {
  neutral: {
    accent: "bg-primary",
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  info: {
    accent: "bg-info",
    icon: "bg-info-soft text-info-soft-foreground",
    value: "text-info-soft-foreground",
  },
  success: {
    accent: "bg-success",
    icon: "bg-success-soft text-success-soft-foreground",
    value: "text-success-soft-foreground",
  },
  warning: {
    accent: "bg-warning",
    icon: "bg-warning-soft text-warning-soft-foreground",
    value: "text-warning-soft-foreground",
  },
  danger: {
    accent: "bg-danger",
    icon: "bg-danger-soft text-danger-soft-foreground",
    value: "text-danger-soft-foreground",
  },
};

type KpiCardProps = KpiCardItem & {
  className?: string;
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  description,
  tone = "neutral",
  className,
}: KpiCardProps) {
  const toneClasses = toneClassNames[tone];

  return (
    <Card className={cn("relative overflow-hidden shadow-sm", className)}>
      <span
        className={cn("absolute inset-x-0 top-0 h-1", toneClasses.accent)}
        aria-hidden="true"
      />
      <CardContent className="flex min-h-28 flex-col justify-between gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium leading-snug text-muted-foreground">{label}</p>
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              toneClasses.icon,
            )}
            aria-hidden="true"
          >
            <Icon className="size-4" />
          </span>
        </div>

        <div className="min-w-0 space-y-1">
          <p className={cn("text-2xl font-bold leading-none tabular-nums", toneClasses.value)}>
            {value}
          </p>
          {description ? (
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

type KpiCardsGridProps = {
  items: KpiCardItem[];
  className?: string;
};

export function KpiCardsGrid({ items, className }: KpiCardsGridProps) {
  return (
    <section
      className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}
      aria-label="Indicadores"
    >
      {items.map((item) => (
        <KpiCard key={item.id} {...item} />
      ))}
    </section>
  );
}

type KpiCardsSkeletonProps = {
  count?: number;
  className?: string;
};

export function KpiCardsSkeleton({ count = 4, className }: KpiCardsSkeletonProps) {
  return (
    <section
      className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}
      aria-label="Carregando indicadores"
    >
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="overflow-hidden shadow-sm">
          <CardContent className="flex min-h-28 flex-col justify-between gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-24 max-w-full" />
              <Skeleton className="size-9 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-28 max-w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
