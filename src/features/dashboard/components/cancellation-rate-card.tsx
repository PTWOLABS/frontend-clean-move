"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { CancellationRateData } from "@/features/dashboard/types/dashboard-sections";
import { cn } from "@/shared/utils/cn";

import { DashboardPanel } from "./dashboard-panel";

type CancellationRateCardProps = {
  data: CancellationRateData | null;
  className?: string;
};

const chartConfig = {
  current: {
    label: "Atual",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function formatPercentPoints(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value))} p.p.`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function CancellationRateCard({ data, className }: CancellationRateCardProps) {
  if (!data) {
    return (
      <DashboardPanel title="Taxa de cancelamento" className={className}>
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Sem dados de cancelamento para o período.
        </div>
      </DashboardPanel>
    );
  }

  const gaugeValue =
    data.targetPercent > 0 ? clamp((data.currentPercent / data.targetPercent) * 100, 0, 100) : 0;
  const comparisonIsGood = data.comparisonPercentPoints <= 0;
  const comparisonLabel = `${formatPercentPoints(data.comparisonPercentPoints)} ${
    comparisonIsGood ? "abaixo" : "acima"
  } da meta`;
  const currentPercent = formatPercent(data.currentPercent);
  const targetPercent = formatPercent(data.targetPercent);

  return (
    <DashboardPanel title="Taxa de cancelamento" className={className}>
      <div className="relative mx-auto h-40 w-full max-w-72">
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label={`Taxa de cancelamento atual de ${currentPercent}`}
          className="h-full w-full aspect-auto"
        >
          <RadialBarChart
            data={[{ name: "Atual", value: gaugeValue }]}
            startAngle={180}
            endAngle={0}
            innerRadius="72%"
            outerRadius="100%"
            barSize={16}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              background
              cornerRadius={16}
              fill="var(--color-current)"
              isAnimationActive={false}
            />
          </RadialBarChart>
        </ChartContainer>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center text-center">
          <p className="font-display text-3xl font-semibold leading-none text-card-foreground">
            {currentPercent}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Cancelamentos</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
          <span className="font-medium text-card-foreground">{currentPercent}</span>
          Atual
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="font-medium text-card-foreground">{targetPercent}</span>
          Meta
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-center">
        <p
          className={cn("text-xs font-semibold", comparisonIsGood ? "text-success" : "text-danger")}
        >
          {comparisonLabel}
        </p>
      </div>
    </DashboardPanel>
  );
}
