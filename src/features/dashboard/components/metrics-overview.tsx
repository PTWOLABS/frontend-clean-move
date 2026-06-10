"use client";

import { CalendarDays, DollarSign, Percent, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/shared/utils/lib";

import type { DashboardMetricsOverview } from "../types/api-types";
import { useMetricsOverview } from "../hooks/use-metrics-overview";
import { useDashboardQueryErrorFeedback } from "../hooks/use-dashboard-query-error-feedback";
import { DashboardMetricCardSkeleton, DashboardQueryErrorState } from "./dashboard-query-state";
import { MetricCard, MetricCardProps } from "./metric-card";
import { DashboardMetricsFiltersBase } from "../types/dashboard-sections";

function mapMetricPoints(
  points:
    | DashboardMetricsOverview["appointments"]["points"]
    | DashboardMetricsOverview["averageTicket"]["points"]
    | DashboardMetricsOverview["cancellationRate"]["points"]
    | DashboardMetricsOverview["totalRevenue"]["points"]
    | undefined,
) {
  return (
    points?.map((point) => ({
      value: "valueInCents" in point ? point.valueInCents : point.value,
    })) ?? []
  );
}

type MetricsOverviewProps = {
  filters: DashboardMetricsFiltersBase;
};

export function MetricsOverview({ filters }: MetricsOverviewProps) {
  const { data: metricsOverview, error, isLoading, refetch } = useMetricsOverview(filters);
  const errorFeedback = useDashboardQueryErrorFeedback({
    resourceKey: "metrics-overview",
    resourceLabel: "a visão geral",
    error,
  });

  function buildTrend(percentage: number | null, options?: { invertDirection?: boolean }) {
    const normalizedPercentage = percentage ?? 0;
    const isPositive = normalizedPercentage > 0;
    const isNegative = normalizedPercentage < 0;

    let direction: MetricCardProps["trend"]["direction"] = "neutral";

    if (isPositive) {
      direction = options?.invertDirection ? "down" : "up";
    }

    if (isNegative) {
      direction = options?.invertDirection ? "up" : "down";
    }

    return {
      value: `${normalizedPercentage > 0 ? "+" : ""}${formatPercent(normalizedPercentage)}`,
      direction,
      label: "vs. período anterior",
    } satisfies MetricCardProps["trend"];
  }

  const dashboardMetrics = [
    {
      title: "Agendamentos",
      value: formatNumber(metricsOverview?.appointments.value ?? 0),
      icon: CalendarDays,
      trend: buildTrend(metricsOverview?.appointments.variationPercentage ?? null),
      chartData: mapMetricPoints(metricsOverview?.appointments.points),
    },
    {
      title: "Receita total",
      value: formatCurrency(metricsOverview?.totalRevenue.valueInCents ?? 0),
      icon: Wallet,
      trend: buildTrend(metricsOverview?.totalRevenue.variationPercentage ?? null),
      chartData: mapMetricPoints(metricsOverview?.totalRevenue.points),
    },
    {
      title: "Taxa de cancelamento",
      value: formatPercent(metricsOverview?.cancellationRate.value ?? 0),
      icon: Percent,
      trend: buildTrend(metricsOverview?.cancellationRate.variationInPercentagePoints ?? null, {
        invertDirection: true,
      }),
      chartData: mapMetricPoints(metricsOverview?.cancellationRate.points),
    },
    {
      title: "Ticket médio",
      value: formatCurrency(metricsOverview?.averageTicket.valueInCents ?? 0),
      icon: DollarSign,
      trend: buildTrend(metricsOverview?.averageTicket.variationPercentage ?? null),
      chartData: mapMetricPoints(metricsOverview?.averageTicket.points),
    },
  ] satisfies MetricCardProps[];

  if (isLoading && !metricsOverview) {
    return Array.from({ length: 4 }, (_, index) => (
      <DashboardMetricCardSkeleton key={`dashboard-metric-card-skeleton-${index}`} />
    ));
  }

  if (errorFeedback && !metricsOverview) {
    return (
      <Card className="relative h-full min-h-36 overflow-hidden rounded-2xl border-border/80 bg-card/80 p-4 shadow-xs backdrop-blur-sm sm:p-5 md:col-span-2 xl:col-span-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        />
        <DashboardQueryErrorState
          title={errorFeedback.title}
          description={errorFeedback.description}
          minHeightClassName="min-h-28"
          onRetry={() => void refetch()}
        />
      </Card>
    );
  }

  return (
    <>
      {dashboardMetrics.map((metric) => (
        <MetricCard key={`metric-${metric.title}`} {...metric} />
      ))}
    </>
  );
}
