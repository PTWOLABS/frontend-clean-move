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
import { useQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { areSameDateRanges } from "@/shared/utils/date-ranges";
import { formatLocalDateTimeAsUtcISOString } from "@/shared/utils/lib";

import { TodayAgendaCard, type TodayAgendaItem } from "./today-agenda-card";
import { AGENDA_PAGE_SIZE } from "../constants";
import { AgendaAppointmentsPagination } from "./agenda-appointments-pagination";
import { AgendaAppointmentsToolbar } from "./agenda-appointments-toolbar";
import { AgendaAppointmentDetailsDialog } from "./agenda-appointment-details-dialog";
import { AgendaAppointmentServicesDialog } from "./agenda-appointment-services-dialog";
import {
  getDefaultAgendaFiltersState,
  getInitialAgendaFiltersState,
  persistAgendaFilters,
  type AgendaFiltersState,
} from "../lib/agenda-filters-storage";
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

function areAgendaFiltersStateEqual(left: AgendaFiltersState, right: AgendaFiltersState) {
  return (
    left.statusFilter === right.statusFilter &&
    left.searchField === right.searchField &&
    left.search === right.search &&
    left.periodMode === right.periodMode &&
    (left.periodMode !== "custom" || areSameDateRanges(left.dateRange, right.dateRange))
  );
}

export function TodayAgendaQueryCard() {
  const [initialFilters] = useState(getInitialAgendaFiltersState);
  const [appliedFilters, setAppliedFilters] = useState<AgendaFiltersState>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<AgendaFiltersState>(initialFilters);
  const [page, setPage] = useState(1);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedServicesAppointmentId, setSelectedServicesAppointmentId] = useState<string | null>(
    null,
  );
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentCalendarEvent | null>(null);
  const [appointmentSheetOpen, setAppointmentSheetOpen] = useState(false);

  useEffect(() => {
    persistAgendaFilters(appliedFilters);
  }, [appliedFilters]);

  const filters = useMemo(
    () =>
      buildAgendaAppointmentsFilters({
        status: appliedFilters.statusFilter,
        search: appliedFilters.search,
        searchField: appliedFilters.searchField,
        periodMode: appliedFilters.periodMode,
        dateRange: appliedFilters.dateRange,
        page,
      }),
    [appliedFilters, page],
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
  const defaultFilters = getDefaultAgendaFiltersState();
  const areDraftFiltersDefault = areAgendaFiltersStateEqual(draftFilters, defaultFilters);
  const areAppliedFiltersDefault = areAgendaFiltersStateEqual(appliedFilters, defaultFilters);
  const areDraftFiltersApplied = areAgendaFiltersStateEqual(draftFilters, appliedFilters);

  function clearSelectedAppointments() {
    setSelectedAppointmentId(null);
    setSelectedServicesAppointmentId(null);
  }

  function resetPage() {
    clearSelectedAppointments();
    setPage(1);
  }

  function handleStatusChange(nextStatus: AgendaStatusFilter) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      statusFilter: nextStatus,
    }));
  }

  function handleSearchFieldChange(nextSearchField: AgendaSearchField) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      searchField: nextSearchField,
    }));
  }

  function handleSearchChange(nextSearch: string) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      search: nextSearch,
    }));
  }

  function handleDateRangeChange(nextDateRange: DateRange | undefined) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      dateRange: nextDateRange,
    }));
  }

  function handlePeriodModeChange(nextPeriodMode: AgendaPeriodMode) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      periodMode: nextPeriodMode,
    }));
  }

  function handleApplyFilters() {
    setAppliedFilters({ ...draftFilters });
    resetPage();
  }

  function handleClearFilters() {
    const nextDefaultFilters = getDefaultAgendaFiltersState();

    setDraftFilters(nextDefaultFilters);
    setAppliedFilters(nextDefaultFilters);
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

    if (appliedFilters.statusFilter !== "ALL" && appliedFilters.statusFilter !== status) {
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
            statusFilter={draftFilters.statusFilter}
            searchField={draftFilters.searchField}
            search={draftFilters.search}
            periodMode={draftFilters.periodMode}
            dateRange={draftFilters.dateRange}
            onStatusChange={handleStatusChange}
            onSearchFieldChange={handleSearchFieldChange}
            onSearchChange={handleSearchChange}
            onPeriodModeChange={handlePeriodModeChange}
            onDateRangeChange={handleDateRangeChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            applyFiltersDisabled={areDraftFiltersApplied}
            clearFiltersDisabled={areDraftFiltersDefault && areAppliedFiltersDefault}
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
