"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { DashboardMetricsRevenueAndAppointments } from "@/features/dashboard/api/types";
import { cn } from "@/shared/utils/cn";

import { DashboardPanel } from "./dashboard-panel";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/shared/utils/lib";
import { useFetchMetricsRevenueAndAppointment } from "../hooks/use-fetch-metrics-revenue-and-appointments";

type RevenueAppointmentsChartCardProps = {
  periodLabel?: string;
  className?: string;
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

function formatTrend(value: number) {
  const formattedValue = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(value);

  return `${value > 0 ? "+" : ""}${formattedValue}%`;
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
  periodLabel = "Diário",
  className,
}: RevenueAppointmentsChartCardProps) {
  const { data } = useFetchMetricsRevenueAndAppointment();
  const points = data?.points ?? [];
  const summary = data?.summary;

  return (
    <DashboardPanel
      title="Receita e agendamentos ao longo do tempo"
      className={className}
      action={
        <span className="inline-flex h-8 items-center rounded-lg border border-border/80 bg-muted/30 px-3 text-xs font-medium text-muted-foreground">
          {periodLabel}
        </span>
      }
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
              width={56}
              tickLine={false}
              axisLine={false}
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
