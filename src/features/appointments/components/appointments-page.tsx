"use client";

import type { DatesSetArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import FullCalendar from "@fullcalendar/react";
import { format, isSameMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { AppointmentDetailsCard } from "./appointment-details-card";
import { AppointmentsCalendar } from "./calendar/appointments-calendar";
import { AppointmentsCalendarToolbar } from "./appointments-calendar-toolbar";
import {
  AppointmentsPageProvider,
  type AppointmentsPageContextValue,
} from "../contexts/appointments-page-context";
import { AppointmentsDayAgendaCard } from "./appointments-day-agenda-card";
import { formatDayKey, formatSlotKey } from "../lib/appointments-page.helpers";
import { AppointmentsQuickNavigationCard } from "./appointments-quick-navigation-card";
import {
  buildInitialMockAppointments,
  buildMockAppointment,
  findNextAppointment,
  getAppointmentsForDate,
} from "../lib/appointments-calendar";
import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
} from "../types/appointment-calendar";

export function AppointmentsPage() {
  const [initialCalendarState] = useState(() => {
    const initialAppointments = buildInitialMockAppointments();
    const initialUpcomingAppointment = findNextAppointment(initialAppointments);

    return {
      initialAppointments,
      initialUpcomingAppointment,
      initialSelectedDate: initialUpcomingAppointment?.start ?? new Date(),
    };
  });

  const { initialAppointments, initialUpcomingAppointment, initialSelectedDate } =
    initialCalendarState;

  const calendarRef = useRef<FullCalendar | null>(null);
  const [events, setEvents] = useState<AppointmentCalendarEvent[]>(initialAppointments);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    initialUpcomingAppointment?.id ?? null,
  );
  const [selectedView, setSelectedView] = useState<AppointmentCalendarView>("dayGridMonth");
  const [calendarTitle, setCalendarTitle] = useState(
    format(initialSelectedDate, "MMMM yyyy", { locale: ptBR }),
  );
  const [visibleRange, setVisibleRange] = useState({
    start: startOfMonth(initialSelectedDate),
    end: startOfMonth(
      new Date(initialSelectedDate.getFullYear(), initialSelectedDate.getMonth() + 1),
    ),
  });
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(startOfMonth(initialSelectedDate));
  const [mockSequence, setMockSequence] = useState(initialAppointments.length);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const selectedDayAppointments = getAppointmentsForDate(events, selectedDate);
  const selectedEvent =
    (selectedEventId ? events.find((event) => event.id === selectedEventId) : null) ?? null;
  const visibleAppointments = events.filter(
    (event) =>
      event.start.getTime() >= visibleRange.start.getTime() &&
      event.start.getTime() < visibleRange.end.getTime(),
  );
  const busyDaysInMiniCalendarMonth = new Set(
    events
      .filter((event) => isSameMonth(event.start, miniCalendarMonth))
      .map((event) => formatDayKey(event.start)),
  ).size;

  function getCalendarApi() {
    return calendarRef.current?.getApi() ?? null;
  }

  function syncSelection(date: Date) {
    setSelectedDate(date);
    setMiniCalendarMonth(startOfMonth(date));
  }

  function handleSlotPress(date: Date) {
    setSelectedEventId(null);
    setSelectedSlotKey(formatSlotKey(date));
    syncSelection(date);
  }

  function handleMonthCellPress(date: Date) {
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

  function handleToday() {
    const calendarApi = getCalendarApi();

    if (!calendarApi) {
      return;
    }

    setSelectedSlotKey(null);
    calendarApi.today();
    syncSelection(calendarApi.getDate());
  }

  function handleNavigate(direction: "prev" | "next") {
    const calendarApi = getCalendarApi();

    if (!calendarApi) {
      return;
    }

    setSelectedSlotKey(null);
    if (direction === "prev") {
      calendarApi.prev();
    } else {
      calendarApi.next();
    }

    syncSelection(calendarApi.getDate());
  }

  function handleViewChange(nextView: AppointmentCalendarView) {
    const calendarApi = getCalendarApi();

    if (!calendarApi) {
      return;
    }

    setSelectedSlotKey(null);
    calendarApi.changeView(nextView);
    syncSelection(calendarApi.getDate());
  }

  function handleDateClick(info: DateClickArg) {
    if (info.view.type === "dayGridMonth") {
      handleMonthCellPress(info.date);
      return;
    }

    handleSlotPress(info.date);
  }

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault();
    setSelectedSlotKey(null);
    setSelectedEventId(info.event.id);

    if (info.event.start) {
      syncSelection(info.event.start);
    }
  }

  function handleMiniCalendarSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    setIsDatePickerOpen(false);
    setSelectedSlotKey(null);
    setSelectedEventId(null);
    syncSelection(date);
    getCalendarApi()?.gotoDate(date);
  }

  function handleAddMockAppointment() {
    const dayAppointments = getAppointmentsForDate(events, selectedDate);
    const nextAppointmentDraft = buildMockAppointment(selectedDate, mockSequence, dayAppointments);

    setEvents((currentEvents) =>
      [...currentEvents, nextAppointmentDraft].sort(
        (left, right) => left.start.getTime() - right.start.getTime(),
      ),
    );
    setSelectedSlotKey(null);
    setMockSequence((currentSequence) => currentSequence + 1);
    setSelectedEventId(nextAppointmentDraft.id);
    syncSelection(nextAppointmentDraft.start);

    const calendarApi = getCalendarApi();

    if (!calendarApi) {
      return;
    }

    if (selectedView === "dayGridMonth") {
      calendarApi.changeView("timeGridDay", nextAppointmentDraft.start);
    } else {
      calendarApi.gotoDate(nextAppointmentDraft.start);
    }
  }

  function handleAgendaItemClick(event: AppointmentCalendarEvent) {
    setSelectedSlotKey(null);
    setSelectedEventId(event.id);
    syncSelection(event.start);
    getCalendarApi()?.gotoDate(event.start);
  }

  function handleMiniCalendarMonthChange(month: Date) {
    setMiniCalendarMonth(month);
  }

  function handleDatePickerOpenChange(open: boolean) {
    setIsDatePickerOpen(open);
  }

  const contextValue: AppointmentsPageContextValue = {
    calendarRef,
    initialSelectedDate,
    events,
    selectedDate,
    selectedEventId,
    selectedView,
    calendarTitle,
    miniCalendarMonth,
    selectedSlotKey,
    isDatePickerOpen,
    selectedDayAppointments,
    selectedEvent,
    busyDaysInMiniCalendarMonth,
    setMiniCalendarMonth: handleMiniCalendarMonthChange,
    setIsDatePickerOpen: handleDatePickerOpenChange,
    handleSlotPress,
    handleMonthCellPress,
    handleDatesSet,
    handleDateClick,
    handleEventClick,
    handleToday,
    handleNavigate,
    handleViewChange,
    handleMiniCalendarSelect,
    handleAddMockAppointment,
    handleAgendaItemClick,
  };

  return (
    <AppointmentsPageProvider value={contextValue}>
      <section className="flex min-h-0 flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
              Planejamento operacional
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Agendamentos</h1>
            <Badge
              variant="outline"
              className="rounded-full border-border/70 bg-card/80 px-2.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {visibleAppointments.length} no período
            </Badge>
          </div>

          <Badge
            variant="outline"
            className="w-fit rounded-full border-border/70 bg-card/80 px-3 py-1 text-xs text-muted-foreground"
          >
            Apenas dados mockados nesta etapa
          </Badge>
        </header>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="min-w-0 overflow-hidden rounded-3xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
            <CardHeader className="border-b border-border/70 px-4 py-3 sm:px-5 sm:py-4">
              <AppointmentsCalendarToolbar />
            </CardHeader>

            <CardContent className="p-3 md:p-4">
              <AppointmentsCalendar />
            </CardContent>
          </Card>

          <div className="min-w-0 space-y-4">
            <AppointmentsQuickNavigationCard />
            <AppointmentsDayAgendaCard />
            <AppointmentDetailsCard />
          </div>
        </div>
      </section>
    </AppointmentsPageProvider>
  );
}
