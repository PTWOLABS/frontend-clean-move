"use client";

import type { DatesSetArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import FullCalendar from "@fullcalendar/react";
import { format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo, useRef, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { AppointmentsCalendar } from "./calendar/appointments-calendar";
import { AppointmentsCalendarToolbar } from "./appointments-calendar-toolbar";
import { AppointmentsDayAgendaCard } from "./appointments-day-agenda-card";
import { AppointmentsQuickNavigationCard } from "./appointments-quick-navigation-card";
import { useListAppointments } from "../hooks/queries/use-list-appointments";
import {
  findNextAppointment,
  formatCalendarRange,
  getAppointmentsForDate,
  getViewLabel,
} from "../lib/appointments-calendar";
import { formatSlotKey } from "../lib/appointments-page.helpers";
import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
} from "../types/appointment-calendar";
import { useQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";
import { AppointmentInfoCard } from "./appointment-info-card";

function getInitialVisibleRange(date: Date) {
  const start = startOfMonth(date);

  return {
    start,
    end: startOfMonth(new Date(start.getFullYear(), start.getMonth() + 1, 1)),
  };
}

function formatAppointmentsCount(count: number) {
  return `${count} agendamento${count === 1 ? "" : "s"}`;
}

export function AppointmentsPage() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [initialSelectedDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<"auto" | "manual">("auto");
  const [selectedView, setSelectedView] = useState<AppointmentCalendarView>("dayGridMonth");
  const [calendarTitle, setCalendarTitle] = useState(
    format(initialSelectedDate, "MMMM yyyy", { locale: ptBR }),
  );
  const [visibleRange, setVisibleRange] = useState(() =>
    getInitialVisibleRange(initialSelectedDate),
  );
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      startsAt: visibleRange.start.toISOString(),
      endsAt: visibleRange.end.toISOString(),
    }),
    [visibleRange.end, visibleRange.start],
  );

  const { data: events = [], isPending, isError, refetch, error } = useListAppointments(filters);

  const isLoadingAppointments = isPending && events.length === 0;
  const hasAppointmentsError = isError && events.length === 0;

  const errorFeedback = useQueryFeedbackError({
    resourceKey: "calendar-appointments",
    resourceLabel: "os agendamentos",
    error: error,
  });

  const defaultSelectedEvent =
    selectionSource === "auto" ? (findNextAppointment(events) ?? events[0] ?? null) : null;
  const selectedEventFromState =
    (selectedEventId ? events.find((event) => event.id === selectedEventId) : null) ?? null;
  const resolvedSelectedEventId = (selectedEventFromState ?? defaultSelectedEvent)?.id ?? null;
  const resolvedSelectedDate =
    selectionSource === "auto" && defaultSelectedEvent ? defaultSelectedEvent.start : selectedDate;
  const visibleAppointments = events.filter(
    (event) =>
      event.start.getTime() >= visibleRange.start.getTime() &&
      event.start.getTime() < visibleRange.end.getTime(),
  );
  const selectedDayAppointments = getAppointmentsForDate(events, resolvedSelectedDate);
  const visibleRangeLabel = formatCalendarRange(visibleRange.start, visibleRange.end);

  function syncSelection(date: Date) {
    setSelectedDate(date);
  }

  function handleSelectDate(date: Date) {
    setSelectionSource("manual");
    setSelectedEventId(null);
    setSelectedSlotKey(null);
    syncSelection(date);
  }

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
    setCalendarTitle(arg.view.title);
    setSelectedView(arg.view.type as AppointmentCalendarView);
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
    syncSelection(event.start);
  }

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault();

    if (!info.event.start) {
      return;
    }

    handleSelectEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end ?? info.event.start,
      extendedProps: info.event.extendedProps as AppointmentCalendarEvent["extendedProps"],
    });
  }

  function handleAgendaItemClick(event: AppointmentCalendarEvent) {
    handleSelectEvent(event);
    calendarRef.current?.getApi()?.gotoDate(event.start);
  }

  function refetchAppointments() {
    void refetch();
  }

  return (
    <section className="flex min-h-0 flex-col gap-4">
      {/* <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
            Planejamento operacional
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Agendamentos</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Organize os agendamentos, acompanhe a ocupação da agenda e navegue pelos períodos de
            atendimento.
          </p>
        </div>

        {errorFeedback || hasAppointmentsError ? (
          <Badge
            variant="outline"
            className="w-fit rounded-full border-danger-soft bg-danger-soft px-3 py-1 text-xs text-danger-soft-foreground"
          >
            Falha ao carregar
          </Badge>
        ) : isLoadingAppointments ? (
          <Badge
            variant="outline"
            className="w-fit rounded-full border-border/70 bg-card/80 px-3 py-1 text-xs text-muted-foreground"
          >
            Carregando dados
          </Badge>
        ) : null}
      </header> */}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AppointmentInfoCard
          title="Período visível"
          mainContent={formatAppointmentsCount(visibleAppointments.length)}
          description={visibleRangeLabel}
        />
        <AppointmentInfoCard
          title="Dia selecionado"
          mainContent={formatAppointmentsCount(selectedDayAppointments.length)}
          description={format(resolvedSelectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        />
        <AppointmentInfoCard
          title="Visualização"
          mainContent={getViewLabel(selectedView)}
          description={calendarTitle}
        />
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0 overflow-hidden rounded-2xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm sm:rounded-3xl">
          <CardHeader className="border-b border-border/70 px-4 py-3 sm:px-5 sm:py-4">
            <AppointmentsCalendarToolbar
              calendarRef={calendarRef}
              calendarTitle={calendarTitle}
              selectedDate={resolvedSelectedDate}
              selectedView={selectedView}
              onSelectDate={handleSelectDate}
            />
          </CardHeader>

          <CardContent className="p-2 sm:p-3 md:p-4">
            <AppointmentsCalendar
              calendarRef={calendarRef}
              initialSelectedDate={initialSelectedDate}
              events={events}
              isLoading={isLoadingAppointments}
              isError={!!errorFeedback || hasAppointmentsError}
              onRetry={refetchAppointments}
              selectedDate={resolvedSelectedDate}
              selectedEventId={resolvedSelectedEventId}
              selectedSlotKey={selectedSlotKey}
              selectedView={selectedView}
              onDateClick={handleDateClick}
              onDatesSet={handleDatesSet}
              onEventClick={handleEventClick}
              onMonthCellPress={handleMonthCellPress}
              onSlotPress={handleSlotPress}
            />
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-4">
          <AppointmentsQuickNavigationCard
            key={format(resolvedSelectedDate, "yyyy-MM")}
            calendarRef={calendarRef}
            events={events}
            selectedDate={resolvedSelectedDate}
            onSelectDate={handleSelectDate}
          />
          <AppointmentsDayAgendaCard
            selectedDate={resolvedSelectedDate}
            selectedEventId={resolvedSelectedEventId}
            events={events}
            isLoading={isLoadingAppointments}
            isError={!!errorFeedback || hasAppointmentsError}
            onRetry={refetchAppointments}
            onSelectEvent={handleAgendaItemClick}
          />
        </div>
      </div>
    </section>
  );
}
