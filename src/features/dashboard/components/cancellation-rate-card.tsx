"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { CancellationRateData } from "@/features/dashboard/types/dashboard-sections";

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

  const currentPercent = formatPercent(data.currentPercent);
  const targetPercent = formatPercent(data.targetPercent);

  return (
    <DashboardPanel title="Taxa de cancelamento" className={className}>
      <div className="mx-auto flex w-full max-w-80 flex-col items-center">
        <div className="relative h-95 w-full">
          <ChartContainer
            config={chartConfig}
            role="img"
            aria-label={`Taxa de cancelamento atual de ${currentPercent}`}
            className="h-full w-full aspect-auto"
          >
            <RadialBarChart
              data={[{ name: "Atual", value: gaugeValue }]}
              startAngle={190}
              endAngle={-10}
              cx="50%"
              cy="50%"
              innerRadius="80%"
              outerRadius="100%"
              barSize={16}
            >
              <defs>
                <linearGradient id="cancellationGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.75} />
                </linearGradient>
              </defs>

              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

              <RadialBar
                dataKey="value"
                background={{
                  fill: "hsl(var(--muted-foreground) / 0.18)",
                }}
                cornerRadius={999}
                fill="url(#cancellationGradient)"
                isAnimationActive={false}
              />
            </RadialBarChart>
          </ChartContainer>

          <div className="pointer-events-none absolute inset-x-0 top-35 flex flex-col items-center text-center">
            <p className="font-display text-3xl font-semibold leading-none text-card-foreground">
              {currentPercent}
            </p>
            <p className="mt-2 text-[14px] text-muted-foreground">Cancelamentos</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground absolute inset-0 top-45">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
            <span className="text-lg font-medium text-card-foreground">{currentPercent}</span>
            <span>Atual</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-muted-foreground/30" />
            <span className="font-medium text-card-foreground">{targetPercent}</span>
            <span>Meta</span>
          </span>
        </div>
      </div>
    </DashboardPanel>
  );
}
