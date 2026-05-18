"use client";

import { CalendarDays, DollarSign, Percent, Wallet } from "lucide-react";

import { formatCurrency, formatNumber } from "@/shared/utils/lib";

import type { DashboardMetricsOverview } from "../api/types";
import { useMetricsOverview } from "../hooks/use-metrics-overview";
import { MetricCard, MetricCardProps } from "./metric-card";

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

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

export function MetricsOverview() {
  const { data: metricsOverview } = useMetricsOverview();

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
      value: formatCurrency(metricsOverview?.totalRevenue.value ?? 0),
      icon: Wallet,
      trend: buildTrend(metricsOverview?.totalRevenue.variationPercentage ?? null),
      chartData: mapMetricPoints(metricsOverview?.totalRevenue.points),
    },
    {
      title: "Taxa de cancelamento",
      value: formatPercent(metricsOverview?.cancellationRate.value ?? 0),
      icon: Percent,
      trend: buildTrend(metricsOverview?.cancellationRate.variationPercentage ?? null, {
        invertDirection: true,
      }),
      chartData: mapMetricPoints(metricsOverview?.cancellationRate.points),
    },
    {
      title: "Ticket médio",
      value: formatCurrency(metricsOverview?.averageTicket.value ?? 0),
      icon: DollarSign,
      trend: buildTrend(metricsOverview?.averageTicket.variationPercentage ?? null),
      chartData: mapMetricPoints(metricsOverview?.averageTicket.points),
    },
  ] satisfies MetricCardProps[];

  return (
    <>
      {dashboardMetrics.map((metric) => (
        <MetricCard key={`metric-${metric.title}`} {...metric} />
      ))}
    </>
  );
}
