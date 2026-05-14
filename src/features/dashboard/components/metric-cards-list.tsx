"use client";

import { CalendarDays } from "lucide-react";
import { useMetricsOverview } from "../hooks/use-metrics-overview";
import { MetricCard, MetricCardProps } from "./metric-card";

export function MetricsCardList() {
  const { data: metricsOverview } = useMetricsOverview();

  const dashboardMetrics = [
    {
      title: "Agendamentos",
      value: metricsOverview?.appointmentsCount.toString() || "0",
      icon: CalendarDays,
      trend: {
        value: "18%",
        direction: "up",
        label: "vs. período anterior",
      },
      chartData: [
        { value: 12 },
        { value: 18 },
        { value: 21 },
        { value: 30 },
        { value: 26 },
        { value: 23 },
        { value: 31 },
        { value: 29 },
        { value: 35 },
      ],
    },
    {
      title: "Receita total",
      value: metricsOverview?.appointmentsCount.toString() || "0",
      icon: CalendarDays,
      trend: {
        value: "18%",
        direction: "up",
        label: "vs. período anterior",
      },
      chartData: [
        { value: 12 },
        { value: 18 },
        { value: 21 },
        { value: 30 },
        { value: 26 },
        { value: 23 },
        { value: 31 },
        { value: 29 },
        { value: 35 },
      ],
    },
    {
      title: "Saída",
      value: metricsOverview?.appointmentsCount.toString() || "0",
      icon: CalendarDays,
      trend: {
        value: "18%",
        direction: "down",
        label: "vs. período anterior",
      },
      chartData: [
        { value: 35 },
        { value: 30 },
        { value: 26 },
        { value: 21 },
        { value: 29 },
        { value: 31 },
        { value: 18 },
        { value: 23 },
        { value: 12 },
      ],
    },
    {
      title: "Ticket médio",
      value: metricsOverview?.appointmentsCount.toString() || "0",
      icon: CalendarDays,
      trend: {
        value: "18%",
        direction: "up",
        label: "vs. período anterior",
      },
      chartData: [
        { value: 12 },
        { value: 18 },
        { value: 21 },
        { value: 30 },
        { value: 26 },
        { value: 23 },
        { value: 31 },
        { value: 29 },
        { value: 35 },
      ],
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
