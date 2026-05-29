"use client";

import type { DatesSetArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import FullCalendar from "@fullcalendar/react";
import { format, isSameDay, isSameMonth, isSameYear, startOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronDown, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select/select";

import { AppointmentsCalendar } from "./calendar/appointments-calendar";
import { AppointmentsCalendarToolbar } from "./appointments-calendar-toolbar";
import { AppointmentsDayAgendaCard } from "./appointments-day-agenda-card";
import { NextAppointment, UpcomingAppointmentsCard } from "./upcoming-appointments-card";
import { useUpdateAppointmentStatus } from "../hooks/mutations/use-update-appointment-status-mutation";
import { useListCalendarAppointments } from "../hooks/queries/use-list-calendar-appointments";
import { findNextAppointment } from "../lib/appointments-calendar";
import {
  compactViewOptions,
  compactViewToggleOptions,
  formatSlotKey,
  navigationCalendarClassNames,
  normalizeCalendarDate,
  viewOptions,
} from "../lib/appointments-page.helpers";
import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
} from "../types/appointment-calendar";
import { useQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";
import { AppointmentFormSheet } from "./form-sheet/appointment-form-sheet";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { cn } from "@/shared/utils/cn";

type AppointmentStatusFilter = "ALL" | AppointmentStatus;

const COMPACT_CALENDAR_VIEW_QUERY = "(max-width: 767px)";

const statusFilterOptions: Array<{
  label: string;
  value: AppointmentStatusFilter;
}> = [
  {
    label: "Status: Todos",
    value: "ALL",
  },
  {
    label: "Status: Concluído",
    value: "DONE",
  },
  {
    label: "Status: Agendado",
    value: "SCHEDULED",
  },
  {
    label: "Status: Cancelado",
    value: "CANCELLED",
  },
];

const calendarStatusLegendItems = [
  {
    label: "Concluído",
    dotClassName: "bg-success",
  },
  {
    label: "Agendado",
    dotClassName: "bg-info",
  },
  {
    label: "Cancelado",
    dotClassName: "bg-danger",
  },
] as const;

function getInitialVisibleRange(date: Date) {
  const start = startOfMonth(date);

  return {
    start,
    end: startOfMonth(new Date(start.getFullYear(), start.getMonth() + 1, 1)),
  };
}

function capitalizeFirst(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isAppointmentCalendarView(view: string): view is AppointmentCalendarView {
  return view === "dayGridMonth" || view === "timeGridWeek" || view === "timeGridDay";
}

function resolveAppointmentCalendarView(
  view: string,
  rawStart: Date,
  rawEndExclusive: Date,
): AppointmentCalendarView {
  if (isAppointmentCalendarView(view)) {
    return view;
  }

  const normalizedView = view.toLowerCase();

  if (normalizedView.includes("month")) {
    return "dayGridMonth";
  }

  if (normalizedView.includes("week")) {
    return "timeGridWeek";
  }

  const start = normalizeCalendarDate(rawStart);
  const end = subDays(normalizeCalendarDate(rawEndExclusive), 1);

  if (normalizedView.includes("day") || normalizedView.includes("list") || isSameDay(start, end)) {
    return "timeGridDay";
  }

  return "dayGridMonth";
}

function formatCalendarToolbarTitle(
  rawStart: Date,
  rawEndExclusive: Date,
  view: AppointmentCalendarView,
) {
  const start = normalizeCalendarDate(rawStart);
  const endExclusive = normalizeCalendarDate(rawEndExclusive);
  const end = subDays(endExclusive, 1);

  if (isSameDay(start, end)) {
    return capitalizeFirst(format(start, "d 'de' MMMM 'de' yyyy", { locale: ptBR }));
  }

  if (view === "dayGridMonth") {
    return capitalizeFirst(format(start, "MMMM 'de' yyyy", { locale: ptBR }));
  }

  if (view === "timeGridDay") {
    return capitalizeFirst(format(start, "d 'de' MMMM 'de' yyyy", { locale: ptBR }));
  }

  if (isSameMonth(start, end) && isSameYear(start, end)) {
    return `${format(start, "d", { locale: ptBR })} - ${format(end, "d 'de' MMM 'de' yyyy", {
      locale: ptBR,
    })}`;
  }

  if (isSameYear(start, end)) {
    return `${format(start, "d 'de' MMM", { locale: ptBR })} - ${format(
      end,
      "d 'de' MMM 'de' yyyy",
      { locale: ptBR },
    )}`;
  }

  return `${format(start, "d 'de' MMM 'de' yyyy", { locale: ptBR })} - ${format(
    end,
    "d 'de' MMM 'de' yyyy",
    { locale: ptBR },
  )}`;
}

function resolveCalendarToolbarTitle(arg: DatesSetArg, view: AppointmentCalendarView) {
  const titleStart = view === "dayGridMonth" ? arg.view.currentStart : arg.start;
  const titleEnd = view === "dayGridMonth" ? arg.view.currentEnd : arg.end;

  return formatCalendarToolbarTitle(titleStart, titleEnd, view);
}

function getVehiclePlate(vehicle: string) {
  const plate = vehicle.trim().slice(-7);

  return plate;
}

type AppointmentsDateFilterProps = {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
};

function AppointmentsDateFilter({ value, onChange, className }: AppointmentsDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    setIsOpen(false);
    onChange(date);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-between rounded-md border-border/80 bg-card/70 px-3 text-left font-normal shadow-xs hover:bg-muted/40",
            className,
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate text-sm text-card-foreground">
              {format(value, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[18.5rem] rounded-2xl border-border/80 p-0">
        <MiniCalendar
          key={format(value, "yyyy-MM")}
          mode="single"
          locale={ptBR}
          defaultMonth={value}
          selected={value}
          onSelect={handleSelect}
          className="w-full"
          classNames={navigationCalendarClassNames}
        />
      </PopoverContent>
    </Popover>
  );
}

function CalendarStatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-muted-foreground">
      {calendarStatusLegendItems.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("size-2 rounded-full ring-2 ring-background/70", item.dotClassName)}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function useCompactCalendarNavigation() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(COMPACT_CALENDAR_VIEW_QUERY);
    const handleChange = () => setIsCompact(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isCompact;
}

export function AppointmentsPage() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [initialSelectedDate] = useState(() => new Date());
  const [initialUpcomingEvents, setInitialUpcomingEvents] = useState<
    AppointmentCalendarEvent[] | null
  >(null);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<"auto" | "manual">("auto");
  const [selectedView, setSelectedView] = useState<AppointmentCalendarView>("dayGridMonth");
  const [appointmentStatusFilter, setAppointmentStatusFilter] =
    useState<AppointmentStatusFilter>("ALL");
  const [calendarTitle, setCalendarTitle] = useState(() => {
    const initialRange = getInitialVisibleRange(initialSelectedDate);

    return formatCalendarToolbarTitle(initialRange.start, initialRange.end, "dayGridMonth");
  });
  const [visibleRange, setVisibleRange] = useState(() =>
    getInitialVisibleRange(initialSelectedDate),
  );
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [appointmentSheetOpen, setAppointmentSheetOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentCalendarEvent | null>(null);
  const isCompactCalendarNavigation = useCompactCalendarNavigation();
  const availableViewFilterOptions = isCompactCalendarNavigation ? compactViewOptions : viewOptions;
  const availableViewToggleOptions = isCompactCalendarNavigation
    ? compactViewToggleOptions
    : undefined;

  const filters = useMemo(
    () => ({
      startsAt: visibleRange.start.toISOString(),
      endsAt: visibleRange.end.toISOString(),
      ...(appointmentStatusFilter === "ALL" ? {} : { status: [appointmentStatusFilter] }),
    }),
    [appointmentStatusFilter, visibleRange.end, visibleRange.start],
  );

  const {
    data: events = [],
    isPending,
    isFetching,
    isError,
    refetch,
    error,
  } = useListCalendarAppointments(filters);
  const updateAppointmentStatusMutation = useUpdateAppointmentStatus();

  const isLoadingAppointments = isPending && events.length === 0;
  const isRefreshingAppointments = isFetching && !isLoadingAppointments;
  const hasAppointmentsError = isError && events.length === 0;
  const updatingStatusAppointmentId = updateAppointmentStatusMutation.isPending
    ? (updateAppointmentStatusMutation.variables?.appointmentId ?? null)
    : null;

  const errorFeedback = useQueryFeedbackError({
    resourceKey: "calendar-appointments",
    resourceLabel: "os agendamentos",
    error: error,
  });

  useEffect(() => {
    if (initialUpcomingEvents !== null || isPending || isError) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- captura o primeiro carregamento para manter a lista lateral estável ao trocar filtros
    setInitialUpcomingEvents(events);
  }, [events, initialUpcomingEvents, isError, isPending]);

  const upcomingEventsSource = initialUpcomingEvents ?? events;

  const upcommingFiveAppointments: NextAppointment[] = useMemo(() => {
    if (upcomingEventsSource.length === 0 || !initialSelectedDate) return [];

    return upcomingEventsSource
      .filter((event) => new Date(event.startsAt) > initialSelectedDate)
      .filter((_event, index) => index < 5)
      .map((event) => ({
        id: event.id,
        startsAt: event.startsAt,
        serviceName: event.extendedProps.service,
        vehiclePlate:
          event.extendedProps.vehicle === "Veículo não informado"
            ? "-------"
            : getVehiclePlate(event.extendedProps.vehicle),
        tone: event.extendedProps.tone,
        customerName: event.extendedProps.customer,
      }));
  }, [upcomingEventsSource, initialSelectedDate]);

  const defaultSelectedEvent =
    selectionSource === "auto" ? (findNextAppointment(events) ?? events[0] ?? null) : null;
  const selectedEventFromState =
    (selectedEventId ? events.find((event) => event.id === selectedEventId) : null) ?? null;
  const resolvedSelectedEventId = (selectedEventFromState ?? defaultSelectedEvent)?.id ?? null;
  const resolvedSelectedDate =
    selectionSource === "auto" && defaultSelectedEvent
      ? defaultSelectedEvent.startsAt
      : selectedDate;

  function syncSelection(date: Date) {
    setSelectedDate(date);
  }

  function handleSelectDate(date: Date) {
    setSelectionSource("manual");
    setSelectedEventId(null);
    setSelectedSlotKey(null);
    syncSelection(date);
  }

  function handleDateFilterSelect(date: Date) {
    const selectedDate = normalizeCalendarDate(date);

    handleSelectDate(selectedDate);
    calendarRef.current?.getApi()?.gotoDate(selectedDate);
  }

  function handleCalendarViewChange(nextView: AppointmentCalendarView) {
    setSelectedView(nextView);

    const calendarApi = calendarRef.current?.getApi();

    if (!calendarApi) {
      return;
    }

    calendarApi.changeView(nextView);
    syncSelection(calendarApi.getDate());
  }

  function handleStatusFilterChange(nextStatus: AppointmentStatusFilter) {
    setAppointmentStatusFilter(nextStatus);
    setSelectionSource("auto");
    setSelectedEventId(null);
    setSelectedSlotKey(null);
  }

  useEffect(() => {
    if (!isCompactCalendarNavigation || selectedView !== "timeGridWeek") {
      return;
    }

    // Ao entrar no layout compacto, a visão semanal sai da navegação.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronização explícita com breakpoint responsivo
    setSelectedView("dayGridMonth");

    const calendarApi = calendarRef.current?.getApi();

    if (!calendarApi) {
      return;
    }

    calendarApi.changeView("dayGridMonth");
    setSelectedDate(calendarApi.getDate());
  }, [isCompactCalendarNavigation, selectedView]);

  function handleSlotPress(date: Date) {
    setSelectionSource("manual");
    setSelectedEventId(null);
    setSelectedSlotKey(formatSlotKey(date));
    syncSelection(date);
  }

  function handleMonthCellPress(date: Date) {
    setSelectionSource("manual");
    setSelectedEventId(null);
    setSelectedSlotKey(null);
    syncSelection(date);
  }

  function handleDatesSet(arg: DatesSetArg) {
    const nextView = resolveAppointmentCalendarView(arg.view.type, arg.start, arg.end);

    setCalendarTitle(resolveCalendarToolbarTitle(arg, nextView));
    setSelectedView(nextView);
    setVisibleRange({
      start: arg.start,
      end: arg.end,
    });
  }

  function handleDateClick(info: DateClickArg) {
    if (info.view.type === "dayGridMonth") {
      handleMonthCellPress(info.date);
      return;
    }

    handleSlotPress(info.date);
  }

  function handleSelectEvent(event: AppointmentCalendarEvent) {
    setSelectionSource("manual");
    setSelectedSlotKey(null);
    setSelectedEventId(event.id);
    syncSelection(event.startsAt);
  }

  function handleClearSelectedEvent() {
    setSelectionSource("manual");
    setSelectedEventId(null);
    setSelectedSlotKey(null);
  }

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault();

    if (!info.event.start) {
      return;
    }

    handleSelectEvent({
      id: info.event.id,
      title: info.event.title,
      startsAt: info.event.start,
      end: info.event.end ?? info.event.start,
      extendedProps: info.event.extendedProps as AppointmentCalendarEvent["extendedProps"],
    });
  }

  function handleAgendaItemClick(event: AppointmentCalendarEvent) {
    handleSelectEvent(event);
    calendarRef.current?.getApi()?.gotoDate(event.startsAt);
  }

  function handleCreateAppointmentSheetOpen(open: boolean) {
    if (open) {
      setAppointmentToEdit(null);
    }

    setAppointmentSheetOpen(open);
  }

  function handleAppointmentSheetOpenChange(open: boolean) {
    setAppointmentSheetOpen(open);

    if (!open) {
      setAppointmentToEdit(null);
    }
  }

  function handleEditAppointment(event: AppointmentCalendarEvent) {
    handleSelectEvent(event);
    setAppointmentToEdit(event);
    setAppointmentSheetOpen(true);
  }

  function handleEditAppointmentFromPopover(event: AppointmentCalendarEvent) {
    setSelectionSource("manual");
    setSelectedEventId(null);
    setSelectedSlotKey(null);
    syncSelection(event.startsAt);
    setAppointmentToEdit(event);
    setAppointmentSheetOpen(true);
  }

  function handleAppointmentStatusChange(appointmentId: string, status: AppointmentStatus) {
    updateAppointmentStatusMutation.mutate({
      appointmentId,
      status,
    });
  }

  function refetchAppointments() {
    void refetch();
  }

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Agendamentos
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Visualize e gerencie todos os agendamentos da sua operação.
            </p>
          </div>

          <Button
            type="button"
            className="h-11 w-full sm:w-auto sm:min-w-[12.5rem]"
            onClick={() => {
              handleCreateAppointmentSheetOpen(true);
            }}
          >
            <Plus className="size-4" />
            Novo agendamento
          </Button>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 xl:max-w-[58rem]">
          <AppointmentsDateFilter value={resolvedSelectedDate} onChange={handleDateFilterSelect} />

          <Select
            value={selectedView}
            onChange={handleCalendarViewChange}
            options={availableViewFilterOptions}
            className="h-11 rounded-md border-border/80 bg-card/70 shadow-xs"
          />

          <Select
            value={appointmentStatusFilter}
            onChange={handleStatusFilterChange}
            options={statusFilterOptions}
            className="h-11 rounded-md border-border/80 bg-card/70 shadow-xs"
          />
        </div>

        {errorFeedback || hasAppointmentsError ? (
          <Badge
            role="alert"
            variant="outline"
            className="w-fit rounded-full border-danger-soft bg-danger-soft px-3 py-1 text-xs text-danger-soft-foreground"
          >
            Falha ao carregar
          </Badge>
        ) : null}
      </header>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0 overflow-visible rounded-2xl border-border/80 bg-card/80 shadow-xl backdrop-blur-sm sm:rounded-3xl">
          <CardHeader className="border-b border-border/70 px-4 py-3 sm:px-5 sm:py-4">
            <AppointmentsCalendarToolbar
              calendarRef={calendarRef}
              calendarTitle={calendarTitle}
              selectedView={selectedView}
              viewOptions={availableViewToggleOptions}
              onSelectDate={handleSelectDate}
              onSelectView={handleCalendarViewChange}
            />
          </CardHeader>

          <CardContent className="space-y-3 p-2 sm:p-3 md:p-4">
            <AppointmentsCalendar
              calendarRef={calendarRef}
              initialSelectedDate={initialSelectedDate}
              events={events}
              isLoading={isLoadingAppointments || isRefreshingAppointments}
              isError={!!errorFeedback || hasAppointmentsError}
              onRetry={refetchAppointments}
              selectedDate={resolvedSelectedDate}
              selectedEventId={resolvedSelectedEventId}
              selectedEventPopoverId={selectedEventFromState?.id ?? null}
              selectedSlotKey={selectedSlotKey}
              selectedView={selectedView}
              updatingStatusAppointmentId={updatingStatusAppointmentId}
              onClearSelectedEvent={handleClearSelectedEvent}
              onDateClick={handleDateClick}
              onDatesSet={handleDatesSet}
              onEventClick={handleEventClick}
              onMonthCellPress={handleMonthCellPress}
              onSlotPress={handleSlotPress}
              onCellAddIndicatorPress={handleCreateAppointmentSheetOpen}
              onEditEvent={handleEditAppointmentFromPopover}
              onStatusChange={handleAppointmentStatusChange}
            />
            <CalendarStatusLegend />
          </CardContent>
        </Card>

        <div className="flex min-h-0 min-w-0 flex-col gap-4 h-full xl:max-h-[52rem] xl:overflow-hidden">
          <UpcomingAppointmentsCard
            appointments={upcommingFiveAppointments}
            isLoading={isLoadingAppointments}
          />
          <AppointmentsDayAgendaCard
            selectedDate={resolvedSelectedDate}
            selectedEventId={resolvedSelectedEventId}
            events={events}
            isLoading={isLoadingAppointments}
            isRefreshing={isRefreshingAppointments}
            isError={!!errorFeedback || hasAppointmentsError}
            updatingStatusAppointmentId={updatingStatusAppointmentId}
            onRetry={refetchAppointments}
            onEditEvent={handleEditAppointment}
            onSelectEvent={handleAgendaItemClick}
            onStatusChange={handleAppointmentStatusChange}
          />
        </div>
      </div>
      <AppointmentFormSheet
        open={appointmentSheetOpen}
        onOpenChange={handleAppointmentSheetOpenChange}
        defaultStartsAt={selectedDate}
        appointment={appointmentToEdit}
      />
    </section>
  );
}
