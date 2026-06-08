"use client";

import {
  addDays,
  addMonths,
  endOfDay,
  isAfter,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { type DateRange } from "react-day-picker";

import { DatePickerWithRange } from "@/components/ui/calendar/date-picker-with-range";

import { MetricsOverview } from "./metrics-overview";
import { PopularServicesCard } from "./popular-services-card";
import { RevenueAppointmentsChartCard } from "./revenue-appointments-chart-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AppointmentStatus } from "@/shared/types/appointments";
import {
  DashboardGranularity,
  DashboardMetricsFiltersBase,
  DashboardPeriod,
} from "../types/dashboard-sections";
import { Select } from "@/components/ui/select/select";
import { AppointmentsHistoryTable } from "./tables/appointments-history/appointments-history-table";
import { MostFrequentCustomersTable } from "./tables/most-frequent-customers/most-frequent-customers-table";
import Link from "next/link";

type DashboardPeriodFilter = DashboardPeriod | "custom";
type DashboardStatusFilter = "ALL" | AppointmentStatus;

const MAX_CUSTOM_DATE_RANGE_MONTHS = 24;

const periodsOptions: {
  label: string;
  value: DashboardPeriodFilter;
}[] = [
  {
    label: "Personalizado",
    value: "custom",
  },
  {
    label: "Últimos 7 dias",
    value: "last-7-days",
  },
  {
    label: "Últimos 30 dias",
    value: "last-30-days",
  },
  {
    label: "Este mês",
    value: "this-month",
  },
];

function getDateRangeForPeriod(period: DashboardPeriod): DateRange {
  const today = startOfDay(new Date());

  switch (period) {
    case "last-7-days":
      return {
        from: addDays(today, -6),
        to: today,
      };
    case "last-30-days":
      return {
        from: addDays(today, -29),
        to: today,
      };
    case "this-month":
      return {
        from: startOfMonth(today),
        to: today,
      };
  }
}

export function limitCustomDashboardDateRange(dateRange?: DateRange): DateRange | undefined {
  if (!dateRange?.from || !dateRange.to) {
    return dateRange;
  }

  const maxEndDate = addMonths(startOfDay(dateRange.from), MAX_CUSTOM_DATE_RANGE_MONTHS);
  const normalizedEndDate = startOfDay(dateRange.to);

  if (!isAfter(normalizedEndDate, maxEndDate)) {
    return dateRange;
  }

  return {
    ...dateRange,
    to: maxEndDate,
  };
}

export function getCustomDashboardDateRangeFilters(
  dateRange?: DateRange,
): Pick<DashboardMetricsFiltersBase, "startsAt" | "endsAt"> {
  const limitedDateRange = limitCustomDashboardDateRange(dateRange);

  return {
    startsAt: limitedDateRange?.from,
    endsAt: limitedDateRange?.to ? endOfDay(limitedDateRange.to) : undefined,
  };
}

export function getMatchingDashboardPeriodForDateRange(
  dateRange?: DateRange,
): DashboardPeriod | undefined {
  if (!dateRange?.from || !dateRange.to) {
    return undefined;
  }

  const matchingPeriod = (
    ["last-7-days", "last-30-days", "this-month"] satisfies DashboardPeriod[]
  ).find((periodOption) => {
    const periodRange = getDateRangeForPeriod(periodOption);

    return (
      isSameDay(dateRange.from!, periodRange.from!) && isSameDay(dateRange.to!, periodRange.to!)
    );
  });

  return matchingPeriod;
}

const statusOptions: {
  label: string;
  value: DashboardStatusFilter;
}[] = [
  {
    label: "Todos",
    value: "ALL",
  },
  {
    label: "Concluído",
    value: "DONE",
  },
  {
    label: "Agendados",
    value: "SCHEDULED",
  },
];

const granularityOptions: {
  label: string;
  value: DashboardGranularity;
}[] = [
  {
    label: "Diário",
    value: "daily",
  },
  {
    label: "Semanal",
    value: "weekly",
  },
  {
    label: "Mensal",
    value: "monthly",
  },
];

export function getDashboardMetricsFilters({
  period,
  dateRange,
  status,
}: {
  period: DashboardPeriodFilter;
  dateRange?: DateRange;
  status: DashboardStatusFilter;
}): DashboardMetricsFiltersBase {
  const resolvedStatus: AppointmentStatus[] = status === "ALL" ? ["DONE", "SCHEDULED"] : [status];

  if (period !== "custom") {
    return {
      period,
      status: resolvedStatus,
    };
  }

  const matchingPeriod = getMatchingDashboardPeriodForDateRange(dateRange);

  if (matchingPeriod) {
    return {
      period: matchingPeriod,
      status: resolvedStatus,
    };
  }

  return {
    ...getCustomDashboardDateRangeFilters(dateRange),
    status: resolvedStatus,
  };
}

export function MetricsSections() {
  const [period, setPeriod] = useState<DashboardPeriodFilter>("last-30-days");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(() =>
    getDateRangeForPeriod("last-30-days"),
  );
  const [status, setStatus] = useState<DashboardStatusFilter>("ALL");

  const isCustomPeriod = period === "custom";
  const resolvedDateRange = isCustomPeriod ? customDateRange : getDateRangeForPeriod(period);
  const selectedPeriodLabel =
    periodsOptions.find((option) => option.value === period)?.label ?? "Período";

  function handlePeriodChange(nextPeriod: DashboardPeriodFilter) {
    if (nextPeriod === "custom") {
      setCustomDateRange(resolvedDateRange);
      setPeriod(nextPeriod);
      return;
    }

    setCustomDateRange(getDateRangeForPeriod(nextPeriod));
    setPeriod(nextPeriod);
  }

  function handleCustomDateRangeChange(nextDateRange: DateRange | undefined) {
    setCustomDateRange(limitCustomDashboardDateRange(nextDateRange));
  }

  const filters = getDashboardMetricsFilters({
    period,
    dateRange: resolvedDateRange,
    status,
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe os principais indicadores da operação.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex w-full flex-col gap-2 xl:max-w-[56rem] xl:flex-1">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.7fr)_minmax(11rem,1fr)_minmax(11rem,1fr)]">
              <DatePickerWithRange
                value={resolvedDateRange}
                onChange={handleCustomDateRangeChange}
                disabled={!isCustomPeriod}
                className="h-11 md:w-full md:min-w-0"
              />

              <Select
                options={periodsOptions}
                value={period}
                onChange={handlePeriodChange}
                className="h-11 rounded-md border-border/80 bg-card/70 shadow-xs"
              />
              <Select
                options={statusOptions}
                value={status}
                onChange={(value) => setStatus(value)}
                className="h-11 rounded-md border-border/80 bg-card/70 shadow-xs"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {isCustomPeriod
                ? "Período personalizado ativo. Ajuste manualmente o intervalo pelo calendário."
                : `${selectedPeriodLabel} aplicado automaticamente. Troque para Personalizado para editar as datas.`}
            </p>
          </div>

          <div className="w-full sm:w-auto xl:shrink-0 lg:self-start">
            <Button className="h-11 w-full sm:min-w-50" asChild>
              <Link href="/appointments?new=true">
                <Plus className="size-4" />
                Novo agendamento
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricsOverview filters={filters} />

        <RevenueAppointmentsChartCard
          className="md:col-span-2 xl:col-span-3"
          filters={filters}
          granularityOptions={granularityOptions}
          defaultGranularity="daily"
        />

        <PopularServicesCard className="md:col-span-2 xl:col-span-1" filters={filters} />
      </div>
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-6">
        <AppointmentsHistoryTable
          filters={{
            startsAt: resolvedDateRange?.from,
            endsAt: resolvedDateRange?.to ? endOfDay(resolvedDateRange.to) : undefined,
          }}
        />
        <MostFrequentCustomersTable filters={filters} />
      </div>
    </div>
  );
}
