import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

type CatalogContentShellProps = {
  toolbar?: ReactNode;
  table?: ReactNode;
  mobileCards?: ReactNode;
  detailsPanel?: ReactNode;
  pagination?: ReactNode;
  skeleton?: ReactNode;
  emptyState?: ReactNode;
  emptyMessage?: ReactNode;
  isLoading?: boolean;
  isFetching?: boolean;
  isEmpty?: boolean;
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  mainClassName?: string;
  listClassName?: string;
};

function DefaultEmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function CatalogContentShell({
  toolbar,
  table,
  mobileCards,
  detailsPanel,
  pagination,
  skeleton,
  emptyState,
  emptyMessage = "Nenhum item encontrado para os filtros atuais.",
  isLoading = false,
  isFetching = false,
  isEmpty = false,
  className,
  contentClassName,
  bodyClassName,
  mainClassName,
  listClassName,
}: CatalogContentShellProps) {
  const hasDetailsPanel = Boolean(detailsPanel);
  const isContentLoading = isLoading || isFetching;
  const shouldShowPagination = !isContentLoading && !isEmpty && Boolean(pagination);

  return (
    <Card className={className} aria-busy={isContentLoading}>
      <CardContent className={cn("space-y-6 rounded-lg bg-card/80 p-4 sm:p-6", contentClassName)}>
        {toolbar}

        <div
          className={cn(
            "flex flex-col gap-6",
            hasDetailsPanel && "lg:flex-row lg:items-stretch",
            bodyClassName,
          )}
        >
          <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-6", mainClassName)}>
            <div className={cn("space-y-6", listClassName)}>
              {isContentLoading ? (
                skeleton
              ) : isEmpty ? (
                (emptyState ?? <DefaultEmptyState>{emptyMessage}</DefaultEmptyState>)
              ) : (
                <>
                  {table}
                  {mobileCards}
                </>
              )}
            </div>

            {shouldShowPagination ? (
              <div className="mt-auto shrink-0" aria-live="polite">
                {pagination}
              </div>
            ) : null}
          </div>

          {detailsPanel}
        </div>
      </CardContent>
    </Card>
  );
}
