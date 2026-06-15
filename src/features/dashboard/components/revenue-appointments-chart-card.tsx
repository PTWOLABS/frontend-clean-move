"use client";

import { differenceInCalendarDays } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Select } from "@/components/ui/select/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardMetricsRevenueAndAppointments } from "@/features/dashboard/types/api-types";
import { cn } from "@/shared/utils/cn";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/shared/utils/lib";
import { useState } from "react";

import { DashboardPanel } from "./dashboard-panel";
import { DashboardPanelSkeleton, DashboardQueryErrorState } from "./dashboard-query-state";
import { useFetchMetricsRevenueAndAppointment } from "../hooks/use-fetch-metrics-revenue-and-appointments";
import { useDashboardQueryErrorFeedback } from "../hooks/use-dashboard-query-error-feedback";
import { DashboardGranularity, DashboardMetricsFiltersBase } from "../types/dashboard-sections";

type RevenueAppointmentsChartCardProps = {
  granularityOptions: {
    label: string;
    value: DashboardGranularity;
  }[];
  defaultGranularity: DashboardGranularity;
  className?: string;
  filters?: DashboardMetricsFiltersBase;
};

type RevenueAppointmentsPoint = DashboardMetricsRevenueAndAppointments["points"][number];
type RevenueAppointmentsSummary = DashboardMetricsRevenueAndAppointments["summary"];

type RevenueTooltipPayload = {
  color?: string;
  dataKey?: string | number;
  value?: number | string;
  payload?: RevenueAppointmentsPoint;
};

type RevenueTooltipProps = {
  active?: boolean;
  payload?: RevenueTooltipPayload[];
};

type DateRangeLimits = {
  days: number;
};

const chartConfig = {
  revenueInCents: {
    label: "Receita (R$)",
    color: "hsl(var(--primary))",
  },
  appointments: {
    label: "Agendamentos",
    color: "hsl(var(--success))",
  },
} satisfies ChartConfig;

const revenueAppointmentsTooltip =
  "Evolução da receita e dos agendamentos nos filtros selecionados. A granularidade controla o agrupamento dos pontos do gráfico.";

const periodRangeDays = {
  "last-7-days": {
    days: 7,
  },
  "last-30-days": {
    days: 30,
  },
} satisfies Record<
  Exclude<NonNullable<DashboardMetricsFiltersBase["period"]>, "this-month">,
  {
    days: number;
  }
>;

function formatTrend(value: number) {
  const formattedValue = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(value);

  return `${value > 0 ? "+" : ""}${formattedValue}%`;
}

function getDateRangeLimits(filters?: DashboardMetricsFiltersBase) {
  if (filters?.startsAt && filters.endsAt) {
    return {
      days: Math.abs(differenceInCalendarDays(filters.endsAt, filters.startsAt)) + 1,
    } satisfies DateRangeLimits;
  }

  if (filters?.period) {
    if (filters.period === "this-month") {
      return {
        days: new Date().getDate(),
      } satisfies DateRangeLimits;
    }

    return periodRangeDays[filters.period] satisfies DateRangeLimits;
  }

  return null;
}

function isGranularityEnabled(
  granularity: DashboardGranularity,
  rangeLimits: ReturnType<typeof getDateRangeLimits>,
) {
  if (!rangeLimits) {
    return true;
  }

  if (granularity === "auto") {
    return false;
  }

  if (rangeLimits.days <= 7) {
    return granularity === "daily";
  }

  if (rangeLimits.days <= 31) {
    return granularity === "daily" || granularity === "weekly";
  }

  if (rangeLimits.days <= 180) {
    return granularity === "weekly" || granularity === "monthly";
  }

  return granularity === "monthly";
}

function getFiltersWithoutGranularity(filters?: DashboardMetricsFiltersBase) {
  const nextFilters = { ...filters };
  delete nextFilters.granularity;

  return nextFilters;
}

function RevenueAppointmentsTooltip({ active, payload }: RevenueTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  return (
    <div className="grid min-w-44 gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-xs shadow-xl">
      {point?.date ? <p className="font-medium text-foreground">{point.date}</p> : null}

      <div className="grid gap-1.5">
        {payload.map((item) => {
          const itemKey = String(item.dataKey ?? "");
          const isRevenue = itemKey === "revenueInCents";
          const label = isRevenue ? "Receita" : "Agendamentos";
          const value =
            typeof item.value === "number"
              ? isRevenue
                ? formatCurrency(item.value)
                : formatNumber(item.value)
              : item.value;

          return (
            <div key={itemKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {label}
              </span>
              <span className="font-medium tabular-nums text-foreground">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: RevenueAppointmentsSummary["revenueTrendPercent"];
}) {
  const hasTrend = trend !== null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="font-display text-xl font-semibold leading-none text-card-foreground">
          {value}
        </p>
        <span
          className={cn(
            "text-xs font-semibold",
            hasTrend ? (trend >= 0 ? "text-success" : "text-danger") : "text-muted-foreground",
          )}
        >
          {hasTrend ? formatTrend(trend) : "Sem comparação"}
        </span>
      </div>
    </div>
  );
}

export function RevenueAppointmentsChartCard({
  granularityOptions,
  defaultGranularity,
  className,
  filters,
}: RevenueAppointmentsChartCardProps) {
  const [granularity, setGranularity] = useState(defaultGranularity);
  const rangeLimits = getDateRangeLimits(filters);
  const resolvedGranularityOptions = granularityOptions.map((option) => ({
    ...option,
    disabled: !isGranularityEnabled(option.value, rangeLimits),
  }));
  const selectedGranularity = isGranularityEnabled(granularity, rangeLimits)
    ? granularity
    : resolvedGranularityOptions.find((option) => !option.disabled)?.value;

  const filtersWithoutGranularity = getFiltersWithoutGranularity(filters);

  const { data, error, isLoading, refetch } = useFetchMetricsRevenueAndAppointment({
    ...filtersWithoutGranularity,
    ...(selectedGranularity ? { granularity: selectedGranularity } : {}),
  });

  const errorFeedback = useDashboardQueryErrorFeedback({
    resourceKey: "revenue-and-appointments",
    resourceLabel: "receita e agendamentos",
    error,
  });
  const points = data?.points ?? [];
  const summary = data?.summary;

  const action = granularityOptions.length ? (
    <Select
      options={resolvedGranularityOptions}
      className="h-8 w-32 border-border/80 bg-muted/30 text-xs shadow-xs"
      value={selectedGranularity}
      onChange={setGranularity}
    />
  ) : null;

  if (isLoading && !data) {
    return (
      <DashboardPanelSkeleton
        title="Receita e agendamentos ao longo do tempo"
        titleTooltip={revenueAppointmentsTooltip}
        className={className}
        action={action}
      >
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>

        <Skeleton className="h-72 w-full rounded-xl" />

        <div className="mt-4 grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      </DashboardPanelSkeleton>
    );
  }

  if (errorFeedback && !data) {
    return (
      <DashboardPanel
        title="Receita e agendamentos ao longo do tempo"
        titleTooltip={revenueAppointmentsTooltip}
        className={className}
        action={action}
      >
        <DashboardQueryErrorState
          title={errorFeedback.title}
          description={errorFeedback.description}
          minHeightClassName="min-h-72"
          onRetry={() => void refetch()}
        />
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel
      title="Receita e agendamentos ao longo do tempo"
      titleTooltip={revenueAppointmentsTooltip}
      className={className}
      action={action}
    >
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
          Receita (R$)
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-success" />
          Agendamentos
        </span>
      </div>

      {points.length ? (
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label="Gráfico de receita e agendamentos ao longo do tempo"
          className="h-72 w-full aspect-auto"
        >
          <AreaChart
            accessibilityLayer
            data={points}
            margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenueInCents)" stopOpacity={0.28} />
                <stop offset="55%" stopColor="var(--color-revenueInCents)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="var(--color-revenueInCents)" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-appointments)" stopOpacity={0.22} />
                <stop offset="60%" stopColor="var(--color-appointments)" stopOpacity={0.06} />
                <stop offset="100%" stopColor="var(--color-appointments)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="4 4" />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval="preserveStartEnd"
            />

            <YAxis
              yAxisId="revenue"
              width={72}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCompactCurrency}
            />

            <YAxis
              yAxisId="appointments"
              orientation="right"
              width={32}
              tickLine={false}
              axisLine={false}
            />

            <ChartTooltip
              cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }}
              content={<RevenueAppointmentsTooltip />}
            />

            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenueInCents"
              stroke="var(--color-revenueInCents)"
              fill="url(#revenueGradient)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--color-revenueInCents)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />

            <Area
              yAxisId="appointments"
              type="monotone"
              dataKey="appointments"
              stroke="var(--color-appointments)"
              fill="url(#appointmentsGradient)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--color-appointments)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Sem dados de receita e agendamentos para o período.
        </div>
      )}

      {summary ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-2">
          <SummaryMetric
            label="Receita no período"
            value={formatCurrency(summary.revenueInCents)}
            trend={summary.revenueTrendPercent}
          />
          <SummaryMetric
            label="Agendamentos no período"
            value={formatNumber(summary.appointments)}
            trend={summary.appointmentsTrendPercent}
          />
        </div>
      ) : null}
    </DashboardPanel>
  );
}
