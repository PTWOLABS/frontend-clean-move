"use client";

import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

import { AppointmentFormSheet } from "@/features/appointments/components/form-sheet/appointment-form-sheet";
import { useListAppointments } from "@/features/appointments/hooks/queries/use-list-appointments";
import { useUpdateAppointmentStatus } from "@/features/appointments/hooks/mutations/use-update-appointment-status-mutation";
import type { AppointmentsFilters } from "@/features/appointments/types/api-filters";
import type {
  AppointmentCalendarEvent,
  AppointmentTone,
} from "@/features/appointments/types/appointment-calendar";
import { mapAppointmentListItemToPresentationItem } from "@/shared/components/appointments/appointment-presenters";
import { useDebounce } from "@/shared/hooks/use-debounced-value";
import { useQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { formatLocalDateTimeAsUtcISOString } from "@/shared/utils/lib";

import { TodayAgendaCard, type TodayAgendaItem } from "./today-agenda-card";
import { AGENDA_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "../constants";
import { AgendaAppointmentsPagination } from "./agenda-appointments-pagination";
import { AgendaAppointmentsToolbar } from "./agenda-appointments-toolbar";
import { AgendaAppointmentDetailsDialog } from "./agenda-appointment-details-dialog";
import { AgendaAppointmentServicesDialog } from "./agenda-appointment-services-dialog";
import { getInitialAgendaFiltersState, persistAgendaFilters } from "../lib/agenda-filters-storage";
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
  periodMode,
  dateRange,
  page,
}: {
  status: AgendaStatusFilter;
  search: string;
  searchField: AgendaSearchField;
  periodMode: AgendaPeriodMode;
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

  const periodBounds = getAgendaPeriodBounds(periodMode, dateRange);

  if (periodBounds.startsAt) {
    filters.startsAt = formatLocalDateTimeAsUtcISOString(periodBounds.startsAt);
  }

  if (periodBounds.endsAt) {
    filters.endsAt = formatLocalDateTimeAsUtcISOString(periodBounds.endsAt);
  }

  return filters;
}

function getAgendaPeriodBounds(
  periodMode: AgendaPeriodMode,
  dateRange?: DateRange,
): {
  startsAt?: Date;
  endsAt?: Date;
} {
  const today = new Date();

  switch (periodMode) {
    case "custom": {
      if (!dateRange?.from) return {};

      const endDate = dateRange.to ?? dateRange.from;

      return {
        startsAt: startOfDay(dateRange.from),
        endsAt: endOfDay(endDate),
      };
    }
    case "this-month":
      return {
        startsAt: startOfMonth(today),
        endsAt: endOfMonth(today),
      };
    case "last-7-days":
      return {
        startsAt: startOfDay(addDays(today, -6)),
        endsAt: endOfDay(today),
      };
    case "last-30-days":
      return {
        startsAt: startOfDay(addDays(today, -29)),
        endsAt: endOfDay(today),
      };
    case "from-today":
      return {
        startsAt: startOfDay(today),
      };
    case "all":
      return {};
  }
}

function getAppointmentTone(status: AppointmentStatus): AppointmentTone {
  switch (status) {
    case "DONE":
      return "success";
    case "CANCELLED":
      return "danger";
    case "SCHEDULED":
      return "info";
  }
}

function mapAgendaItemToCalendarEvent(appointment: TodayAgendaItem): AppointmentCalendarEvent {
  const servicesLabel = appointment.services.map((service) => service.name).join(", ");
  const appointmentStatus: AppointmentStatus =
    appointment.status === "IN_PROGRESS" ? "SCHEDULED" : appointment.status;

  return {
    id: appointment.id,
    title: appointment.serviceName,
    startsAt: appointment.startsAt,
    end: appointment.endsAt ?? appointment.startsAt,
    extendedProps: {
      customerId: appointment.customerId,
      customer: appointment.customerName,
      serviceIds: appointment.services.map((service) => ({
        value: service.id,
        label: service.name,
      })),
      service: servicesLabel || appointment.serviceName,
      vehicleId: appointment.vehicleId,
      vehicle: {
        plate: appointment.vehicleRawPlate,
        brand: appointment.vehicleBrand,
        model: appointment.vehicleModel,
        displayName: appointment.vehicleDisplayName,
      },
      endsAt: appointment.endsAt,
      description: appointment.description,
      discountValue: appointment.discountValue,
      notes: appointment.description || "Sem observações operacionais.",
      tone: getAppointmentTone(appointmentStatus),
      status: appointmentStatus,
    },
  };
}

function mapAppointmentsToTodayAgendaItems(
  appointments: AppointmentListItem[] | undefined,
): TodayAgendaItem[] {
  return (appointments ?? [])
    .map(mapAppointmentListItemToPresentationItem)
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());
}

export function TodayAgendaQueryCard() {
  const [initialFilters] = useState(getInitialAgendaFiltersState);
  const [statusFilter, setStatusFilter] = useState<AgendaStatusFilter>(initialFilters.statusFilter);
  const [searchField, setSearchField] = useState<AgendaSearchField>(initialFilters.searchField);
  const [search, setSearch] = useState(initialFilters.search);
  const [periodMode, setPeriodMode] = useState<AgendaPeriodMode>(initialFilters.periodMode);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialFilters.dateRange);
  const [page, setPage] = useState(1);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedServicesAppointmentId, setSelectedServicesAppointmentId] = useState<string | null>(
    null,
  );
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentCalendarEvent | null>(null);
  const [appointmentSheetOpen, setAppointmentSheetOpen] = useState(false);
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    persistAgendaFilters({
      statusFilter,
      searchField,
      search,
      periodMode,
      dateRange,
    });
  }, [dateRange, periodMode, search, searchField, statusFilter]);

  const filters = useMemo(
    () =>
      buildAgendaAppointmentsFilters({
        status: statusFilter,
        search: debouncedSearch,
        searchField,
        periodMode,
        dateRange,
        page,
      }),
    [dateRange, debouncedSearch, page, periodMode, searchField, statusFilter],
  );

  const { data, error, isPending, isPlaceholderData, refetch } = useListAppointments(filters);
  const updateAppointmentStatusMutation = useUpdateAppointmentStatus();

  const feedback = useQueryFeedbackError({
    error,
    resourceKey: "agenda-appointments",
    resourceLabel: "os agendamentos",
  });

  const appointments = useMemo(
    () => mapAppointmentsToTodayAgendaItems(data?.appointments),
    [data?.appointments],
  );
  const selectedAppointment = useMemo(
    () =>
      selectedAppointmentId
        ? (appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? null)
        : null,
    [appointments, selectedAppointmentId],
  );
  const selectedServicesAppointment = useMemo(
    () =>
      selectedServicesAppointmentId
        ? (appointments.find((appointment) => appointment.id === selectedServicesAppointmentId) ??
          null)
        : null,
    [appointments, selectedServicesAppointmentId],
  );
  const isFetchingPage = isPending || isPlaceholderData;
  const updatingStatusAppointmentId = updateAppointmentStatusMutation.isPending
    ? (updateAppointmentStatusMutation.variables?.appointmentId ?? null)
    : null;

  function clearSelectedAppointments() {
    setSelectedAppointmentId(null);
    setSelectedServicesAppointmentId(null);
  }

  function resetPage() {
    clearSelectedAppointments();
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

  function handleEditAppointment(appointment: TodayAgendaItem) {
    setAppointmentToEdit(mapAgendaItemToCalendarEvent(appointment));
    setSelectedAppointmentId(null);
    setAppointmentSheetOpen(true);
  }

  function handleAppointmentSheetOpenChange(open: boolean) {
    setAppointmentSheetOpen(open);

    if (!open) {
      setAppointmentToEdit(null);
    }
  }

  async function handleAppointmentStatusChange(appointmentId: string, status: AppointmentStatus) {
    await updateAppointmentStatusMutation.mutateAsync({
      appointmentId,
      status,
    });

    if (statusFilter !== "ALL" && statusFilter !== status) {
      setSelectedAppointmentId(null);
    }
  }

  return (
    <>
      <TodayAgendaCard
        appointments={appointments}
        isError={Boolean(feedback)}
        isLoading={isFetchingPage}
        onRetry={() => void refetch()}
        onAppointmentClick={(appointment) => setSelectedAppointmentId(appointment.id)}
        onAppointmentServicesClick={(appointment) =>
          setSelectedServicesAppointmentId(appointment.id)
        }
        pagination={
          <AgendaAppointmentsPagination
            page={page}
            totalItems={data?.totalItems}
            visibleItemsCount={appointments.length}
            isFetching={isFetchingPage}
            onPageChange={(nextPage) => {
              clearSelectedAppointments();
              setPage(nextPage);
            }}
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

      <AgendaAppointmentServicesDialog
        appointment={selectedServicesAppointment}
        open={Boolean(selectedServicesAppointment)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedServicesAppointmentId(null);
          }
        }}
      />

      <AgendaAppointmentDetailsDialog
        appointment={selectedAppointment}
        open={Boolean(selectedAppointment)}
        isUpdatingStatus={updatingStatusAppointmentId === selectedAppointment?.id}
        onEdit={handleEditAppointment}
        onStatusChange={handleAppointmentStatusChange}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointmentId(null);
          }
        }}
      />

      <AppointmentFormSheet
        open={appointmentSheetOpen}
        onOpenChange={handleAppointmentSheetOpenChange}
        appointment={appointmentToEdit}
      />
    </>
  );
}
