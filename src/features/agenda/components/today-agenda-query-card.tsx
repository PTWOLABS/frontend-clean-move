"use client";

import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

import { useListAppointments } from "@/features/appointments/hooks/queries/use-list-appointments";
import type { AppointmentsFilters } from "@/features/appointments/types/api-filters";
import { useDebounce } from "@/shared/hooks/use-debounced-value";
import { useQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";
import {
  getAppointmentAmountInCents,
  getCustomerName,
  getServiceName,
  getVehicleName,
  getVehiclePlate,
  parseAppointmentDateTime,
} from "@/shared/utils/appointments-helpers";
import { formatLocalDateTimeAsUtcISOString } from "@/shared/utils/lib";

import { TodayAgendaCard, type TodayAgendaItem } from "./today-agenda-card";
import { AGENDA_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "../constants";
import { AgendaAppointmentsPagination } from "./agenda-appointments-pagination";
import { AgendaAppointmentsToolbar } from "./agenda-appointments-toolbar";
import { AgendaAppointmentDetailsDialog } from "./agenda-appointment-details-dialog";
import {
  AgendaSearchField,
  AgendaStatusFilter,
  AppointmentListItem,
  AgendaPeriodMode,
} from "../types";

function buildAgendaAppointmentsFilters({
  status,
  search,
  searchField,
  dateRange,
  page,
}: {
  status: AgendaStatusFilter;
  search: string;
  searchField: AgendaSearchField;
  dateRange?: DateRange;
  page: number;
}): AppointmentsFilters {
  const filters: AppointmentsFilters = {
    page,
    size: AGENDA_PAGE_SIZE,
  };

  if (status !== "ALL") {
    filters.status = [status];
  }

  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    filters[searchField] = normalizedSearch;
  }

  if (dateRange?.from) {
    const endDate = dateRange.to ?? dateRange.from;

    filters.startsAt = formatLocalDateTimeAsUtcISOString(startOfDay(dateRange.from));
    filters.endsAt = formatLocalDateTimeAsUtcISOString(endOfDay(endDate));
  }

  return filters;
}

function getDefaultAgendaDateRange(): DateRange {
  const today = new Date();

  return {
    from: addDays(today, -6),
    to: today,
  };
}

function mapAppointmentToTodayAgendaItem(appointment: AppointmentListItem): TodayAgendaItem {
  const startsAt = parseAppointmentDateTime(appointment.startsAt);
  const endsAt = appointment.endsAt ? parseAppointmentDateTime(appointment.endsAt) : null;
  const vehicleName = getVehicleName(appointment);
  const vehiclePlate = getVehiclePlate(appointment);

  return {
    id: appointment.id,
    startsAt,
    time: format(startsAt, "HH:mm"),
    timeRange: endsAt
      ? `${format(startsAt, "HH:mm")} - ${format(endsAt, "HH:mm")}`
      : "Não informado",
    customerName: getCustomerName(appointment),
    vehicleName,
    vehicleLabel: `${vehicleName} • ${vehiclePlate}`,
    vehiclePlate,
    serviceName: getServiceName(appointment),
    amountInCents: getAppointmentAmountInCents(appointment),
    description: appointment.description?.trim() ?? "",
    status: appointment.status,
  };
}

function mapAppointmentsToTodayAgendaItems(
  appointments: AppointmentListItem[] | undefined,
): TodayAgendaItem[] {
  return (appointments ?? [])
    .map(mapAppointmentToTodayAgendaItem)
    .sort((left, right) => left.time.localeCompare(right.time));
}

export function TodayAgendaQueryCard() {
  const [statusFilter, setStatusFilter] = useState<AgendaStatusFilter>("ALL");
  const [searchField, setSearchField] = useState<AgendaSearchField>("serviceName");
  const [search, setSearch] = useState("");
  const [periodMode, setPeriodMode] = useState<AgendaPeriodMode>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultAgendaDateRange);
  const [page, setPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<TodayAgendaItem | null>(null);
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const filters = useMemo(
    () =>
      buildAgendaAppointmentsFilters({
        status: statusFilter,
        search: debouncedSearch,
        searchField,
        dateRange: periodMode === "custom" ? dateRange : undefined,
        page,
      }),
    [dateRange, debouncedSearch, page, periodMode, searchField, statusFilter],
  );

  const { data, error, isPending, isPlaceholderData, refetch } = useListAppointments(filters);

  const feedback = useQueryFeedbackError({
    error,
    resourceKey: "agenda-appointments",
    resourceLabel: "os agendamentos",
  });

  const appointments = useMemo(
    () => mapAppointmentsToTodayAgendaItems(data?.appointments),
    [data?.appointments],
  );
  const isFetchingPage = isPending || isPlaceholderData;

  function resetPage() {
    setPage(1);
  }

  function handleStatusChange(nextStatus: AgendaStatusFilter) {
    setStatusFilter(nextStatus);
    resetPage();
  }

  function handleSearchFieldChange(nextSearchField: AgendaSearchField) {
    setSearchField(nextSearchField);
    resetPage();
  }

  function handleSearchChange(nextSearch: string) {
    setSearch(nextSearch);
    resetPage();
  }

  function handleDateRangeChange(nextDateRange: DateRange | undefined) {
    setDateRange(nextDateRange);
    resetPage();
  }

  function handlePeriodModeChange(nextPeriodMode: AgendaPeriodMode) {
    setPeriodMode(nextPeriodMode);
    resetPage();
  }

  return (
    <>
      <TodayAgendaCard
        appointments={appointments}
        isError={Boolean(feedback)}
        isLoading={isFetchingPage}
        onRetry={() => void refetch()}
        onAppointmentClick={setSelectedAppointment}
        pagination={
          <AgendaAppointmentsPagination
            page={page}
            totalItems={data?.totalItems}
            visibleItemsCount={appointments.length}
            isFetching={isFetchingPage}
            onPageChange={setPage}
          />
        }
        toolbar={
          <AgendaAppointmentsToolbar
            statusFilter={statusFilter}
            searchField={searchField}
            search={search}
            periodMode={periodMode}
            dateRange={dateRange}
            onStatusChange={handleStatusChange}
            onSearchFieldChange={handleSearchFieldChange}
            onSearchChange={handleSearchChange}
            onPeriodModeChange={handlePeriodModeChange}
            onDateRangeChange={handleDateRangeChange}
          />
        }
      />

      <AgendaAppointmentDetailsDialog
        appointment={selectedAppointment}
        open={Boolean(selectedAppointment)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
      />
    </>
  );
}
