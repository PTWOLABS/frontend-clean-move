"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DashboardPeriodOption,
  PopularService,
} from "@/features/dashboard/types/dashboard-sections";

import { DashboardPanel } from "./dashboard-panel";
import { formatNumber } from "@/shared/utils/lib";

type PopularServicesCardProps = {
  items: PopularService[];
  periodOptions: DashboardPeriodOption[];
  defaultPeriod: string;
  className?: string;
};

const MAX_VISIBLE_SERVICES = 5;

function getPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function PopularServicesCard({
  items,
  periodOptions,
  defaultPeriod,
  className,
}: PopularServicesCardProps) {
  const [period, setPeriod] = React.useState(defaultPeriod);
  const selectedPeriod = periodOptions.some((option) => option.value === period)
    ? period
    : periodOptions[0]?.value;
  const totalServices = items.reduce((total, item) => total + item.completedCount, 0);
  const visibleServices = items.slice(0, MAX_VISIBLE_SERVICES);

  return (
    <DashboardPanel
      title="Serviços populares"
      className={className}
      action={
        periodOptions.length ? (
          <Select value={selectedPeriod} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-32 border-border/80 bg-muted/30 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null
      }
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
