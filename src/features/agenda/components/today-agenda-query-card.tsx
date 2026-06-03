"use client";

import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

import { AppointmentFormSheet } from "@/features/appointments/components/form-sheet/appointment-form-sheet";
import { useListAppointments } from "@/features/appointments/hooks/queries/use-list-appointments";
import { useUpdateAppointmentStatus } from "@/features/appointments/hooks/mutations/use-update-appointment-status-mutation";
import type { AppointmentsFilters } from "@/features/appointments/types/api-filters";
import type {
  AppointmentCalendarEvent,
  AppointmentTone,
} from "@/features/appointments/types/appointment-calendar";
import { useDebounce } from "@/shared/hooks/use-debounced-value";
import { useQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";
import { formatReaisToBrlInput } from "@/shared/money/format-brl-money";
import type { AppointmentStatus } from "@/shared/types/appointments";
import {
  getAppointmentAmountInCents,
  getCustomerName,
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
import { AgendaAppointmentServicesDialog } from "./agenda-appointment-services-dialog";
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

function mapAppointmentServices(appointment: AppointmentListItem): TodayAgendaItem["services"] {
  return appointment.services.map((service) => ({
    id: service.id,
    name: service.name.trim() || "Serviço não informado",
    durationInMinutes: service.durationInMinutes,
    priceInCents: service.priceInCents,
  }));
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

function mapAppointmentToTodayAgendaItem(appointment: AppointmentListItem): TodayAgendaItem {
  const startsAt = parseAppointmentDateTime(appointment.startsAt);
  const endsAt = appointment.endsAt ? parseAppointmentDateTime(appointment.endsAt) : null;
  const startTime = format(startsAt, "HH:mm");
  const vehicleName = getVehicleName(appointment);
  const vehiclePlate = getVehiclePlate(appointment);
  const services = mapAppointmentServices(appointment);

  return {
    id: appointment.id,
    customerId: appointment.customerId,
    vehicleId: appointment.vehicleId ?? "",
    startsAt,
    endsAt,
    time: startTime,
    timeRange: endsAt ? `${startTime} - ${format(endsAt, "HH:mm")}` : startTime,
    customerName: getCustomerName(appointment),
    vehicleName,
    vehicleLabel: `${vehicleName} • ${vehiclePlate}`,
    vehiclePlate,
    serviceName: services[0]?.name ?? "Serviço não informado",
    amountInCents: getAppointmentAmountInCents(appointment),
    discountValue:
      appointment.discountInCents === null || appointment.discountInCents === undefined
        ? ""
        : formatReaisToBrlInput(appointment.discountInCents / 100),
    description: appointment.description?.trim() ?? "",
    status: appointment.status,
    services,
  };
}

function mapAgendaItemToCalendarEvent(appointment: TodayAgendaItem): AppointmentCalendarEvent {
  const servicesLabel = appointment.services.map((service) => service.name).join(", ");
  const appointmentStatus: AppointmentStatus =
    appointment.status === "in-progress" ? "SCHEDULED" : appointment.status;

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
      vehicle: appointment.vehicleLabel,
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
    .map(mapAppointmentToTodayAgendaItem)
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());
}

export function TodayAgendaQueryCard() {
  const [statusFilter, setStatusFilter] = useState<AgendaStatusFilter>("ALL");
  const [searchField, setSearchField] = useState<AgendaSearchField>("serviceName");
  const [search, setSearch] = useState("");
  const [periodMode, setPeriodMode] = useState<AgendaPeriodMode>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultAgendaDateRange);
  const [page, setPage] = useState(1);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedServicesAppointmentId, setSelectedServicesAppointmentId] = useState<string | null>(
    null,
  );
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentCalendarEvent | null>(null);
  const [appointmentSheetOpen, setAppointmentSheetOpen] = useState(false);
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
