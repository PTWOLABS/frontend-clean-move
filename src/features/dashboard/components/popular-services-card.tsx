"use client";

import type { DashboardMetricsFiltersBase } from "@/features/dashboard/types/dashboard-sections";

import { DashboardPanel } from "./dashboard-panel";
import { formatNumber } from "@/shared/utils/lib";
import { useFetchPopularServices } from "../hooks/use-fetch-popular-services";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardQueryErrorFeedback } from "../hooks/use-dashboard-query-error-feedback";
import { DashboardPanelSkeleton, DashboardQueryErrorState } from "./dashboard-query-state";

type PopularServicesCardProps = {
  filters?: DashboardMetricsFiltersBase;
  className?: string;
};

function getPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function PopularServicesCard({ filters, className }: PopularServicesCardProps) {
  const { data, error, isLoading, refetch } = useFetchPopularServices(filters);

  const errorFeedback = useDashboardQueryErrorFeedback({
    resourceKey: "popular-services",
    resourceLabel: "serviços populares",
    error,
  });

  const totalServices = data?.totalServices || 0;
  const visibleServices = data?.popularServices || [];

  if (isLoading && !data) {
    return (
      <DashboardPanelSkeleton title="Serviços populares" className={className}>
        <div className="mt-15 space-y-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-16" />
        </div>
      </DashboardPanelSkeleton>
    );
  }

  if (errorFeedback && !data) {
    return (
      <DashboardPanel title="Serviços populares" className={className}>
        <DashboardQueryErrorState
          title={errorFeedback.title}
          description={errorFeedback.description}
          minHeightClassName="min-h-40"
          onRetry={() => void refetch()}
        />
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel title="Serviços populares" className={className}>
      {visibleServices.length ? (
        <div className="mt-15 space-y-4">
          {visibleServices.map((service) => {
            const percentage = getPercentage(service.completedCount, totalServices);

            return (
              <div key={service.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <p className="min-w-0 truncate font-medium text-card-foreground">
                    {service.name}
                  </p>
                  <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums">
                    <span className="font-semibold text-card-foreground">
                      {formatNumber(service.completedCount)}
                    </span>
                    <span className="w-9 text-right text-muted-foreground">{percentage}%</span>
                  </div>
                </div>
                <div
                  aria-label={`${service.name}: ${formatNumber(
                    service.completedCount,
                  )} serviços, ${percentage}% do total`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={percentage}
                  className="h-2 rounded-full bg-muted"
                  role="progressbar"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Nenhum serviço realizado no período.
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
        <p className="text-sm text-muted-foreground">Total de serviços</p>
        <p className="font-display text-xl font-semibold text-card-foreground">
          {formatNumber(totalServices)}
        </p>
      </div>
    </DashboardPanel>
  );
}
