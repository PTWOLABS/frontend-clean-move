import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import { cn } from "@/shared/utils/cn";

import type {
  DashboardMetricsFiltersBase,
  DashboardTopCustomersFilters,
} from "../../../types/dashboard-sections";
import { useDashboardQueryErrorFeedback } from "../../../hooks/use-dashboard-query-error-feedback";
import { useListTopCustomers } from "../../../hooks/use-list-top-customers";
import { MostFrequentCustomersSkeletonRows } from "./most-frequent-customers-skeleton-rows";
import { MostFrequentCustomerRow } from "./most-frequent-customers-rows";
import Link from "next/link";

type MostFrequentCustomersTableProps = {
  className?: string;
  filters?: Pick<DashboardMetricsFiltersBase, "startsAt" | "endsAt" | "period">;
  showMetrics: boolean;
};

const mostFrequentCustomersTooltip =
  "Ranking dos clientes com maior frequência de agendamentos no período.";

function getTopCustomersFilters(
  filters?: MostFrequentCustomersTableProps["filters"],
): DashboardTopCustomersFilters {
  return {
    startsAt: filters?.startsAt,
    endsAt: filters?.endsAt,
    period: filters?.period,
    size: 5,
  };
}

function MostFrequentCustomersMessage({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function MostFrequentCustomersTable({
  className,
  filters,
  showMetrics,
}: MostFrequentCustomersTableProps) {
  const { data, error, isPending, isPlaceholderData } = useListTopCustomers(
    getTopCustomersFilters(filters),
  );
  const showSkeletonRows = isPending || isPlaceholderData;

  const feedback = useDashboardQueryErrorFeedback({
    error,
    resourceKey: "top-customers",
    resourceLabel: "clientes que mais frequentam",
  });

  const customers = data?.customers ?? [];

  return (
    <Card className={cn("h-full min-w-0 md:col-span-2 xl:col-span-2", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 px-4 pb-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <CardTitle className="truncate text-base font-semibold">
            Clientes que mais frequentam
          </CardTitle>
          <HintTooltipProvider>
            <HintTooltip label={mostFrequentCustomersTooltip} className="max-w-64 leading-5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 rounded-full text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                aria-label="Mais informações sobre clientes que mais frequentam"
              >
                <Info className="size-4" />
              </Button>
            </HintTooltip>
          </HintTooltipProvider>
        </div>

        <Button type="button" variant="outline" size="sm" className="shrink-0" asChild>
          <Link href="/customers">Ver todos</Link>
        </Button>
      </CardHeader>

      <CardContent className="px-4 pb-6 pt-1 sm:px-6">
        <HintTooltipProvider>
          {showSkeletonRows ? <MostFrequentCustomersSkeletonRows /> : null}
          {!showSkeletonRows && feedback ? (
            <MostFrequentCustomersMessage message={feedback.description} />
          ) : null}
          {!showSkeletonRows && !feedback && !customers.length ? (
            <MostFrequentCustomersMessage message="Nenhum cliente encontrado no período." />
          ) : null}
          {!showSkeletonRows && !feedback && customers.length ? (
            <ul className="divide-y divide-border">
              {customers.map((customer) => (
                <MostFrequentCustomerRow
                  key={customer.customerId}
                  customer={customer}
                  showMetrics={showMetrics}
                />
              ))}
            </ul>
          ) : null}
        </HintTooltipProvider>
      </CardContent>
    </Card>
  );
}
