import { AlertCircle, RotateCcw } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";

import { DashboardPanel } from "./dashboard-panel";

type DashboardQueryErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
  className?: string;
  minHeightClassName?: string;
};

export function DashboardQueryErrorState({
  title,
  description,
  onRetry,
  className,
  minHeightClassName = "min-h-40",
}: DashboardQueryErrorStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center",
        minHeightClassName,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="mb-3 flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground"
      >
        <AlertCircle className="size-4" />
      </span>
      <p className="text-sm font-medium text-card-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-4 h-9" onClick={onRetry}>
          <RotateCcw className="size-4" />
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

export function DashboardMetricCardSkeleton() {
  return (
    <Card className="relative h-full min-h-36 overflow-hidden rounded-2xl border-border/80 bg-card/80 p-4 shadow-card backdrop-blur-sm sm:p-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-5 h-8 w-32" />
        </div>

        <Skeleton className="size-10 rounded-xl" />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>

        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </Card>
  );
}

type DashboardPanelSkeletonProps = {
  title: string;
  titleTooltip?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardPanelSkeleton({
  title,
  titleTooltip,
  className,
  action,
  children,
}: DashboardPanelSkeletonProps) {
  return (
    <DashboardPanel title={title} titleTooltip={titleTooltip} className={className} action={action}>
      {children}
    </DashboardPanel>
  );
}
