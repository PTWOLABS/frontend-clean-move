"use client";

import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import type {
  DatesSetArg,
  DayCellContentArg,
  DayCellMountArg,
  EventClickArg,
  EventContentArg,
  MoreLinkArg,
  MoreLinkContentArg,
} from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  addMinutes,
  differenceInMinutes,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarClock,
  CalendarDays,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import { createRoot, type Root } from "react-dom/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select/select";
import { cn } from "@/shared/utils/cn";

import styles from "./appointments-page.module.css";
import {
  buildInitialMockAppointments,
  buildMockAppointment,
  findNextAppointment,
  formatCalendarRange,
  getAppointmentsForDate,
  getStatusLabel,
  getViewLabel,
} from "../lib/appointments-calendar";
import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
  AppointmentExtendedProps,
  AppointmentMockStatus,
  AppointmentTone,
} from "../types/appointment-calendar";

const viewOptions: Array<{
  label: string;
  value: AppointmentCalendarView;
}> = [
  {
    label: "Visão mensal",
    value: "dayGridMonth",
  },
  {
    label: "Visão semanal",
    value: "timeGridWeek",
  },
  {
    label: "Visão diária",
    value: "timeGridDay",
  },
];

const toneDotClassName: Record<AppointmentTone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

const toneContainerClassName: Record<AppointmentTone, string> = {
  primary: styles.eventTonePrimary,
  accent: styles.eventToneAccent,
  success: styles.eventToneSuccess,
  warning: styles.eventToneWarning,
  danger: styles.eventToneDanger,
  info: styles.eventToneInfo,
};

const statusBadgeClassName: Record<AppointmentMockStatus, string> = {
  CONFIRMED: "border-transparent bg-success-soft text-success-soft-foreground",
  CHECK_IN: "border-transparent bg-info-soft text-info-soft-foreground",
  WAITING: "border-transparent bg-warning-soft text-warning-soft-foreground",
  FINISHED: "border-transparent bg-secondary text-secondary-foreground",
};

const SLOT_DURATION = "00:30:00";
const SLOT_DURATION_MINUTES = 30;
const SLOT_MIN_TIME = "01:00:00";
const SLOT_MAX_TIME = "24:00:00";
const SLOT_START_HOUR = 1;
const SLOT_END_HOUR = 24;
const SLOT_COUNT = ((SLOT_END_HOUR - SLOT_START_HOUR) * 60) / SLOT_DURATION_MINUTES;

type MorePopoverPlacement = {
  alignRight: boolean;
  rightOffset: number;
};

function SummaryTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="rounded-2xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
      <CardContent className="space-y-2 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <div className="space-y-1">
          <p className="font-display text-2xl font-semibold leading-none text-card-foreground">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatAppointmentTimeRange(event: AppointmentCalendarEvent) {
  return `${format(event.start, "HH:mm", { locale: ptBR })} - ${format(event.end, "HH:mm", {
    locale: ptBR,
  })}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatHeaderMonth(date: Date) {
  return format(date, "MMM", { locale: ptBR }).replace(".", "").toUpperCase();
}

function formatSlotKey(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

function formatDayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function buildSlotDate(date: Date, slotIndex: number) {
  return addMinutes(startOfDay(date), SLOT_START_HOUR * 60 + slotIndex * SLOT_DURATION_MINUTES);
}

function doesEventOverlapSlot(event: AppointmentCalendarEvent, slotStart: Date, slotEnd: Date) {
  return event.start.getTime() < slotEnd.getTime() && event.end.getTime() > slotStart.getTime();
}

function CalendarCellAddIndicator({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={className}>
      <Plus className="size-3.5" />
    </span>
  );
}

function resolveMorePopoverPlacement(linkElement: HTMLElement | null): MorePopoverPlacement | null {
  if (!linkElement) {
    return null;
  }

  const viewHarness = linkElement.closest<HTMLElement>(".fc-view-harness");
  const monthCell = linkElement.closest<HTMLElement>(".fc-daygrid-day");
  const timeGridCell = linkElement.closest<HTMLElement>(".fc-timegrid-col");
  const calendarCell = monthCell ?? timeGridCell;
  const cellSelector = monthCell ? ".fc-daygrid-day" : timeGridCell ? ".fc-timegrid-col" : null;

  if (!viewHarness || !calendarCell || !cellSelector) {
    return null;
  }

  let nextMatchingSibling = calendarCell.nextElementSibling;

  while (nextMatchingSibling && !nextMatchingSibling.matches(cellSelector)) {
    nextMatchingSibling = nextMatchingSibling.nextElementSibling;
  }

  if (nextMatchingSibling) {
    return null;
  }

  const linkRect = linkElement.getBoundingClientRect();
  const harnessRect = viewHarness.getBoundingClientRect();

  return {
    alignRight: true,
    rightOffset: Math.max(0, harnessRect.right - linkRect.right),
  };
}

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
  const [morePopoverPlacement, setMorePopoverPlacement] = useState<MorePopoverPlacement | null>(
    null,
  );
  const monthIndicatorRootsRef = useRef(new WeakMap<HTMLElement, Root>());

  const selectedDayAppointments = getAppointmentsForDate(events, selectedDate);
  const selectedEvent =
    (selectedEventId ? events.find((event) => event.id === selectedEventId) : null) ?? null;
  const visibleAppointments = events.filter(
    (event) =>
      event.start.getTime() >= visibleRange.start.getTime() &&
      event.start.getTime() < visibleRange.end.getTime(),
  );
  const nextAppointment = findNextAppointment(events);
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
    // Placeholder for the future slot action. For now, keep the visual selection only.
    setSelectedEventId(null);
    setSelectedSlotKey(formatSlotKey(date));
    syncSelection(date);
  }

  function handleMonthCellPress(date: Date) {
    // Placeholder for the future month-cell action. For now, keep the visual selection only.
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

  function renderEventContent(arg: EventContentArg) {
    const extendedProps = arg.event.extendedProps as AppointmentExtendedProps;
    const isMonthView = arg.view.type === "dayGridMonth";
    const durationInMinutes =
      arg.event.start && arg.event.end
        ? differenceInMinutes(arg.event.end, arg.event.start)
        : null;

    if (isMonthView) {
      return (
        <div className={styles.monthEventContent}>
          <span className={styles.monthEventTitle}>{arg.event.title}</span>
          <span className={styles.monthEventTime}>{arg.timeText}</span>
        </div>
      );
    }

    const shouldShowMeta = durationInMinutes === null || durationInMinutes >= 60;

    return (
      <div className={styles.eventContent}>
        <div className={styles.eventTitleRow}>
          <span className={styles.eventTitle}>{arg.event.title}</span>
          <span
            aria-hidden="true"
            className={cn(
              "size-2 rounded-full",
              styles.eventToneDot,
              toneDotClassName[extendedProps.tone],
            )}
          />
        </div>
        <span className={styles.eventTime}>{arg.timeText || "Dia inteiro"}</span>
        {shouldShowMeta ? (
          <span className={styles.eventMeta}>
            {`${extendedProps.customer} • ${extendedProps.vehicle}`}
          </span>
        ) : null}
      </div>
    );
  }

  function renderTimeGridDayCellContent(arg: DayCellContentArg) {
    const dayEvents = events.filter(
      (event) => formatDayKey(event.start) === formatDayKey(arg.date),
    );

    return (
      <div
        className={styles.slotOverlayGrid}
        style={{
          gridTemplateRows: `repeat(${SLOT_COUNT}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: SLOT_COUNT }, (_, slotIndex) => {
          const slotStart = buildSlotDate(arg.date, slotIndex);
          const slotEnd = addMinutes(slotStart, SLOT_DURATION_MINUTES);
          const slotKey = formatSlotKey(slotStart);
          const isOccupied = dayEvents.some((event) =>
            doesEventOverlapSlot(event, slotStart, slotEnd),
          );

          if (isOccupied) {
            return <div key={slotKey} aria-hidden="true" className={styles.slotOverlaySpacer} />;
          }

          const isSelectedSlot = selectedSlotKey === slotKey;

          return (
            <button
              key={slotKey}
              type="button"
              aria-label={`Selecionar horário ${format(slotStart, "HH:mm")} em ${format(arg.date, "dd/MM/yyyy")}`}
              className={cn(
                styles.emptySlotButton,
                isSelectedSlot && styles.emptySlotButtonSelected,
              )}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleSlotPress(slotStart);
              }}
            >
              <span aria-hidden="true" className={styles.emptySlotPlus}>
                <Plus className="size-3.5" />
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  function renderDayCellContent(arg: DayCellContentArg) {
    if (arg.view.type.startsWith("timeGrid")) {
      return renderTimeGridDayCellContent(arg);
    }

    return arg.dayNumberText;
  }

  function handleDayCellDidMount(arg: DayCellMountArg) {
    if (arg.view.type !== "dayGridMonth") {
      return;
    }

    const dayFrame = arg.el.querySelector(".fc-daygrid-day-frame");

    if (!dayFrame || dayFrame.querySelector(`.${styles.monthCellIndicatorButton}`)) {
      return;
    }

    const indicatorButton = document.createElement("button");
    indicatorButton.type = "button";
    indicatorButton.className = styles.monthCellIndicatorButton;
    indicatorButton.setAttribute(
      "aria-label",
      `Selecionar dia ${format(arg.date, "dd/MM/yyyy", { locale: ptBR })}`,
    );
    indicatorButton.textContent = "+";
    indicatorButton.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleMonthCellPress(arg.date);
    };

    dayFrame.appendChild(indicatorButton);
    const root = createRoot(indicatorButton);
    root.render(<CalendarCellAddIndicator className={styles.monthCellIndicatorIcon} />);
    monthIndicatorRootsRef.current.set(indicatorButton, root);
  }

  function handleDayCellWillUnmount(arg: DayCellMountArg) {
    const indicatorButton = arg.el.querySelector<HTMLElement>(
      `.${styles.monthCellIndicatorButton}`,
    );

    if (!indicatorButton) {
      return;
    }

    monthIndicatorRootsRef.current.get(indicatorButton)?.unmount();
    monthIndicatorRootsRef.current.delete(indicatorButton);
  }

  function getDayCellClassNames(arg: DayCellContentArg) {
    if (arg.view.type === "dayGridMonth") {
      return [
        styles.monthDayCell,
        !arg.isOther && isSameDay(arg.date, selectedDate) ? styles.monthDayCellSelected : "",
      ];
    }

    return [];
  }

  function renderMoreLinkContent(arg: MoreLinkContentArg) {
    if (arg.view.type !== "dayGridMonth") {
      return `+${arg.num}`;
    }

    return `mais ${arg.num} agendamento${arg.num === 1 ? "" : "s"}`;
  }

  function handleMoreLinkClick(arg: MoreLinkArg) {
    const currentTarget =
      arg.jsEvent.currentTarget instanceof HTMLElement ? arg.jsEvent.currentTarget : null;
    const target = arg.jsEvent.target instanceof HTMLElement ? arg.jsEvent.target : null;
    const linkElement = currentTarget ?? target?.closest<HTMLElement>(".fc-more-link") ?? null;

    setMorePopoverPlacement(resolveMorePopoverPlacement(linkElement));
  }

  const calendarFrameStyle = morePopoverPlacement?.alignRight
    ? ({
        "--fc-more-popover-right-offset": `${morePopoverPlacement.rightOffset}px`,
      } as CSSProperties)
    : undefined;

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Planejamento operacional
            </p>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Agendamentos
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Página construída com FullCalendar em modo local. Clique em um slot para definir a
                data de trabalho ou em um agendamento existente para validar encaixes no mesmo
                horário, navegação, seleção e leitura de detalhes.
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="w-fit rounded-full border-border/70 bg-card/80 px-3 py-1 text-xs text-muted-foreground"
          >
            Apenas dados mockados nesta etapa
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SummaryTile
            label="Período visível"
            value={`${visibleAppointments.length} agendamentos`}
            detail={formatCalendarRange(visibleRange.start, visibleRange.end)}
          />
          <SummaryTile
            label="Dia selecionado"
            value={`${selectedDayAppointments.length} itens`}
            detail={format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          />
          <SummaryTile
            label="Próximo atendimento"
            value={
              nextAppointment ? format(nextAppointment.start, "HH:mm", { locale: ptBR }) : "Livre"
            }
            detail={
              nextAppointment
                ? `${nextAppointment.title} • ${format(nextAppointment.start, "d 'de' MMMM", {
                    locale: ptBR,
                  })}`
                : "Sem novos compromissos mockados"
            }
          />
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
          <CardHeader className="gap-5 border-b border-border/70 pb-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex min-w-[5.25rem] flex-col items-center rounded-2xl border border-border/70 bg-background/70 px-3 py-3 text-center shadow-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    {formatHeaderMonth(selectedDate)}
                  </span>
                  <span className="font-display text-3xl font-semibold leading-none text-card-foreground">
                    {format(selectedDate, "dd")}
                  </span>
                  <span className="mt-2 text-xs text-muted-foreground">
                    {isToday(selectedDate)
                      ? "Hoje"
                      : format(selectedDate, "EEEE", { locale: ptBR })}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="font-display text-2xl font-semibold capitalize text-card-foreground">
                      {calendarTitle}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/70 bg-background/70 text-xs text-muted-foreground"
                    >
                      {getViewLabel(selectedView)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {formatCalendarRange(visibleRange.start, visibleRange.end)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    `dateClick` seleciona a data ativa e `eventClick` abre o painel lateral com os
                    detalhes do compromisso.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-border/80 bg-background/70"
                    onClick={() => handleNavigate("prev")}
                    aria-label="Período anterior"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl border-border/80 bg-background/70 px-4"
                    onClick={handleToday}
                  >
                    Hoje
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-border/80 bg-background/70"
                    onClick={() => handleNavigate("next")}
                    aria-label="Próximo período"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>

                <Select
                  value={selectedView}
                  onChange={handleViewChange}
                  options={viewOptions}
                  className="h-10 min-w-44 rounded-xl border-border/80 bg-background/70 shadow-xs"
                />

                <Button className="h-10 rounded-xl px-4" onClick={handleAddMockAppointment}>
                  <Plus className="size-4" />
                  Novo agendamento
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 md:p-4">
            <div
              className={cn(
                "overflow-visible rounded-2xl border border-border/70 bg-background/40",
                styles.calendarFrame,
                morePopoverPlacement?.alignRight && styles.morePopoverAlignRight,
              )}
              style={calendarFrameStyle}
            >
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                locale={ptBrLocale}
                headerToolbar={false}
                initialView="dayGridMonth"
                initialDate={initialSelectedDate}
                allDaySlot={false}
                firstDay={0}
                nowIndicator
                weekends
                navLinks
                editable={false}
                selectable={false}
                stickyHeaderDates={false}
                slotDuration={SLOT_DURATION}
                slotLabelInterval="01:00:00"
                slotLabelFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                slotMinTime={SLOT_MIN_TIME}
                slotMaxTime={SLOT_MAX_TIME}
                height="auto"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5, 6],
                  startTime: "08:00",
                  endTime: "18:30",
                }}
                views={{
                  dayGridMonth: {
                    fixedWeekCount: false,
                    showNonCurrentDates: true,
                    dayMaxEventRows: 3,
                  },
                  timeGridWeek: {
                    dayHeaderFormat: { weekday: "short", day: "numeric" },
                    slotEventOverlap: false,
                    eventMaxStack: 2,
                  },
                  timeGridDay: {
                    dayHeaderFormat: { weekday: "long", day: "numeric", month: "long" },
                    slotEventOverlap: false,
                    eventMaxStack: 3,
                  },
                }}
                dayCellContent={renderDayCellContent}
                dayCellDidMount={handleDayCellDidMount}
                dayCellWillUnmount={handleDayCellWillUnmount}
                dayCellClassNames={getDayCellClassNames}
                moreLinkContent={renderMoreLinkContent}
                moreLinkClick={handleMoreLinkClick}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                datesSet={handleDatesSet}
                eventContent={renderEventContent}
                eventClassNames={(arg) => {
                  const extendedProps = arg.event.extendedProps as AppointmentExtendedProps;

                  return [
                    styles.eventCard,
                    toneContainerClassName[extendedProps.tone],
                    arg.event.id === selectedEventId ? styles.eventSelected : "",
                  ];
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-3xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Navegação rápida</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use o mini calendário para mover o foco visual sem depender do header interno do
                FullCalendar.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/50">
                <MiniCalendar
                  mode="single"
                  locale={ptBR}
                  month={miniCalendarMonth}
                  onMonthChange={setMiniCalendarMonth}
                  selected={selectedDate}
                  onSelect={handleMiniCalendarSelect}
                  className="w-full"
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                  <Sparkles className="size-4 text-accent" />
                  {busyDaysInMiniCalendarMonth} dias ocupados neste mês
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Os pontos de trabalho permanecem mockados e podem ser expandidos com integração
                  real em uma próxima etapa.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Agenda do dia</CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDayAppointments.length ? (
                selectedDayAppointments.map((event) => {
                  const isActive = selectedEventId === event.id;

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => handleAgendaItemClick(event)}
                      className={cn(
                        "w-full rounded-2xl border border-border/70 bg-background/55 p-4 text-left transition-colors hover:border-accent/40 hover:bg-accent-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive && "border-accent/50 bg-accent-soft/45",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-card-foreground">{event.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {event.extendedProps.customer}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px]",
                            statusBadgeClassName[event.extendedProps.status],
                          )}
                        >
                          {getStatusLabel(event.extendedProps.status)}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-3.5" />
                          {formatAppointmentTimeRange(event)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CarFront className="size-3.5" />
                          {event.extendedProps.vehicle}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
                  <p className="font-medium text-card-foreground">Nenhum agendamento neste dia.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use o botão &quot;Novo agendamento&quot; para inserir um mock local no horário
                    selecionado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Detalhes do agendamento</CardTitle>
              <p className="text-sm text-muted-foreground">
                Painel alimentado por `eventClick` e pela lista lateral.
              </p>
            </CardHeader>
            <CardContent>
              {selectedEvent ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-xl font-semibold text-card-foreground">
                          {selectedEvent.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedEvent.extendedProps.service}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px]",
                          statusBadgeClassName[selectedEvent.extendedProps.status],
                        )}
                      >
                        {getStatusLabel(selectedEvent.extendedProps.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-border/70 bg-background/45 p-4">
                    <div className="flex items-start gap-3">
                      <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {format(selectedEvent.start, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatAppointmentTimeRange(selectedEvent)} •{" "}
                          {selectedEvent.extendedProps.reminder}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserRound className="mt-0.5 size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {selectedEvent.extendedProps.customer}
                        </p>
                        <p className="text-xs text-muted-foreground">Cliente do atendimento</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CarFront className="mt-0.5 size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {selectedEvent.extendedProps.vehicle}
                        </p>
                        <p className="text-xs text-muted-foreground">Veículo vinculado</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Wrench className="mt-0.5 size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {selectedEvent.extendedProps.notes}
                        </p>
                        <p className="text-xs text-muted-foreground">Observações operacionais</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
                    <p className="text-sm font-medium text-card-foreground">Equipe alocada</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedEvent.extendedProps.attendants.map((attendant) => (
                        <div
                          key={attendant}
                          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-2.5 py-1.5"
                        >
                          <span className="inline-flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                            {getInitials(attendant)}
                          </span>
                          <span className="text-sm text-card-foreground">{attendant}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-accent" />
                    <p className="font-medium text-card-foreground">Nenhum evento selecionado</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Clique em um evento no calendário ou na lista lateral para carregar os detalhes.
                    Se quiser testar a criação local, adicione um novo mock no dia selecionado.
                  </p>
                  <Button className="h-10 rounded-xl px-4" onClick={handleAddMockAppointment}>
                    <Plus className="size-4" />
                    Adicionar mock neste horário
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
