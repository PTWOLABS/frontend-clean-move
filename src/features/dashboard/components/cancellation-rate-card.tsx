"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CancellationRateData,
  DashboardMetricsFiltersBase,
} from "@/features/dashboard/types/dashboard-sections";

import { DashboardPanel } from "./dashboard-panel";
import { useFetchMetricsAppointment } from "../hooks/use-fetch-metrics-appointments";
import { useDashboardQueryErrorFeedback } from "../hooks/use-dashboard-query-error-feedback";
import { DashboardPanelSkeleton, DashboardQueryErrorState } from "./dashboard-query-state";

type CancellationRateCardProps = {
  className?: string;
  filters?: DashboardMetricsFiltersBase;
  data?: CancellationRateData | null;
};

const chartConfig = {
  current: {
    label: "Atual",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const cancellationRateTooltip =
  "Percentual de agendamentos cancelados nos filtros selecionados, comparado com a meta retornada pela API.";

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function getGaugeValue(data: CancellationRateData) {
  if (data.targetPercent > 0) {
    return Math.min((data.currentPercent / data.targetPercent) * 100, 100);
  }

  return data.currentPercent;
}

export function CancellationRateCard({ className, filters, data }: CancellationRateCardProps) {
  const { data: appointmentsData, error, isLoading, refetch } = useFetchMetricsAppointment(filters);
  const errorFeedback = useDashboardQueryErrorFeedback({
    resourceKey: "cancellation-rate",
    resourceLabel: "a taxa de cancelamento",
    error: data ? null : error,
  });

  const cancellationRateData =
    data ??
    (appointmentsData
      ? {
          currentPercent: appointmentsData.cancellationRate.currentPercent,
          targetPercent: appointmentsData.cancellationRate.comparisonPercentPoints || 0,
          comparisonPercentPoints: appointmentsData.cancellationRate.comparisonPercentPoints || 0,
        }
      : null);

  if (isLoading && !data && !appointmentsData) {
    return (
      <DashboardPanelSkeleton
        title="Taxa de cancelamento"
        titleTooltip={cancellationRateTooltip}
        className={className}
      >
        <div className="mx-auto flex w-full max-w-80 flex-col items-center">
          <Skeleton className="h-64 w-full rounded-full" />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </DashboardPanelSkeleton>
    );
  }

  if (errorFeedback && !data && !appointmentsData) {
    return (
      <DashboardPanel
        title="Taxa de cancelamento"
        titleTooltip={cancellationRateTooltip}
        className={className}
      >
        <DashboardQueryErrorState
          title={errorFeedback.title}
          description={errorFeedback.description}
          minHeightClassName="min-h-64"
          onRetry={() => void refetch()}
        />
      </DashboardPanel>
    );
  }

  if (!cancellationRateData) {
    return (
      <DashboardPanel
        title="Taxa de cancelamento"
        titleTooltip={cancellationRateTooltip}
        className={className}
      >
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Sem dados de cancelamento para o período.
        </div>
      </DashboardPanel>
    );
  }

  const gaugeValue = getGaugeValue(cancellationRateData);

  const currentPercent = formatPercent(cancellationRateData.currentPercent);
  const targetPercent = formatPercent(cancellationRateData.targetPercent);

  return (
    <DashboardPanel
      title="Taxa de cancelamento"
      titleTooltip={cancellationRateTooltip}
      className={className}
    >
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
