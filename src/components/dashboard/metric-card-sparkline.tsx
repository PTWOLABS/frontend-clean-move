"use client";

import { Line, LineChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/shared/utils/cn";

import type { MetricCardChartDataPoint, MetricTrendDirection } from "./metric-card";

const sparklineColors: Record<MetricTrendDirection, string> = {
  up: "hsl(var(--success))",
  down: "hsl(var(--danger))",
  neutral: "hsl(var(--primary))",
};

type MetricCardSparklineProps = {
  data: MetricCardChartDataPoint[];
  direction: MetricTrendDirection;
  ariaLabel: string;
  className?: string;
};

export function MetricCardSparkline({
  data,
  direction,
  ariaLabel,
  className,
}: MetricCardSparklineProps) {
  const chartConfig = {
    value: {
      label: ariaLabel,
      color: sparklineColors[direction],
    },
  } satisfies ChartConfig;

  if (!data.length) {
    return <div aria-hidden="true" className={cn("h-12 w-28 rounded-lg bg-muted/30", className)} />;
  }

  return (
    <ChartContainer
      config={chartConfig}
      role="img"
      aria-label={ariaLabel}
      className={cn("h-12 w-28 shrink-0 aspect-auto", className)}
    >
      <LineChart accessibilityLayer data={data} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={{
            r: 2.4,
            fill: "var(--color-value)",
            stroke: "var(--color-value)",
            strokeWidth: 0,
          }}
          activeDot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
