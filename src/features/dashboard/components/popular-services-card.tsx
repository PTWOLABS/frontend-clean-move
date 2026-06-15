"use client";

import type { DashboardMetricsFiltersBase } from "@/features/dashboard/types/dashboard-sections";

import { DashboardPanel } from "./dashboard-panel";
import { formatNumber } from "@/shared/utils/lib";
import { useFetchPopularServices } from "../hooks/use-fetch-popular-services";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardQueryErrorFeedback } from "../hooks/use-dashboard-query-error-feedback";
import { DashboardPanelSkeleton, DashboardQueryErrorState } from "./dashboard-query-state";
import { cn } from "@/shared/utils/cn";

type PopularServicesCardProps = {
  filters?: DashboardMetricsFiltersBase;
  className?: string;
  showMetrics: boolean;
};

const popularServicesTooltip =
  "Ranking dos serviços concluídos nos filtros selecionados, com a participação de cada serviço no total do período.";

function getPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function PopularServicesCard({ filters, className, showMetrics }: PopularServicesCardProps) {
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
      <DashboardPanelSkeleton
        title="Serviços populares"
        titleTooltip={popularServicesTooltip}
        className={className}
      >
        <div className="mt-15 space-y-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={`popular-services-card-skeleton-${index}`} className="space-y-2">
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
      <DashboardPanel
        title="Serviços populares"
        titleTooltip={popularServicesTooltip}
        className={className}
      >
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
    <DashboardPanel
      title="Serviços populares"
      titleTooltip={popularServicesTooltip}
      className={className}
    >
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
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-3 text-xs tabular-nums",
                      !showMetrics ? "blur-sm" : "blur-none",
                    )}
                  >
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
                  className={cn(
                    "h-2 rounded-full bg-muted",
                    !showMetrics ? "blur-sm" : "blur-none",
                  )}
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
        <p
          className={cn(
            "font-display text-xl font-semibold text-card-foreground",
            !showMetrics ? "blur-sm" : "blur-none",
          )}
        >
          {formatNumber(totalServices)}
        </p>
      </div>
    </DashboardPanel>
  );
}
