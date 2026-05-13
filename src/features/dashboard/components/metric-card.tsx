import * as React from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { MetricCardSparkline } from "@/features/dashboard/components/metric-card-sparkline";
import { Card } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

export type MetricTrendDirection = "up" | "down" | "neutral";

export type MetricCardTrend = {
  value: string;
  direction: MetricTrendDirection;
  label: string;
};

export type MetricCardChartDataPoint = {
  value: number;
  [key: string]: string | number | null | undefined;
};

export type MetricCardProps = Omit<React.ComponentPropsWithoutRef<typeof Card>, "children"> & {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: MetricCardTrend;
  chartData: MetricCardChartDataPoint[];
  chartAriaLabel?: string;
};

const trendMeta: Record<
  MetricTrendDirection,
  {
    icon: LucideIcon;
    className: string;
  }
> = {
  up: {
    icon: ArrowUpRight,
    className: "text-success",
  },
  down: {
    icon: ArrowDownRight,
    className: "text-danger",
  },
  neutral: {
    icon: ArrowRight,
    className: "text-muted-foreground",
  },
};

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, icon: Icon, trend, chartData, chartAriaLabel, className, ...props }, ref) => {
    const TrendIcon = trendMeta[trend.direction].icon;
    const trendClassName = trendMeta[trend.direction].className;

    return (
      <Card
        ref={ref}
        className={cn(
          "relative h-full min-h-36 overflow-hidden rounded-2xl border-border/80 bg-card/80 p-4 shadow-card backdrop-blur-sm sm:p-5",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-none text-card-foreground/85">
              {title}
            </p>
            <p className="mt-5 truncate font-display text-3xl font-semibold leading-none tracking-tight text-card-foreground">
              {value}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/70 text-primary shadow-xs"
          >
            <Icon className="size-4.5" />
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className={cn("inline-flex items-center gap-1 font-semibold", trendClassName)}>
              <TrendIcon aria-hidden="true" className="size-3.5" />
              {trend.value}
            </span>
            <span className="min-w-0 text-muted-foreground">{trend.label}</span>
          </div>

          <MetricCardSparkline
            data={chartData}
            direction={trend.direction}
            ariaLabel={chartAriaLabel ?? `Evolução de ${title}`}
          />
        </div>
      </Card>
    );
  },
);
MetricCard.displayName = "MetricCard";

export { MetricCard };
