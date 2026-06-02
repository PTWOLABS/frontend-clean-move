"use client";

import {
  AgendaSummaryCard,
  type AgendaSummary,
} from "@/features/agenda/components/agenda-summary-card";
import { useFetchMetricsAppointment } from "@/features/dashboard/hooks/use-fetch-metrics-appointments";

function mapMetricsToAgendaSummary(data: {
  total: number;
  byStatus: {
    scheduled: number;
    done: number;
    cancelled: number;
  };
  rates: {
    completion: number;
  };
}): AgendaSummary {
  return {
    total: data.total,
    scheduled: data.byStatus.scheduled,
    done: data.byStatus.done,
    cancelled: data.byStatus.cancelled,
    completionRate: data.rates.completion,
  };
}

export function AgendaSummaryQueryCard() {
  const { data, error, isPending, refetch } = useFetchMetricsAppointment();
  const summary = data ? mapMetricsToAgendaSummary(data) : undefined;

  return (
    <AgendaSummaryCard
      summary={summary}
      isLoading={isPending}
      isError={Boolean(error)}
      onRetry={() => void refetch()}
    />
  );
}
