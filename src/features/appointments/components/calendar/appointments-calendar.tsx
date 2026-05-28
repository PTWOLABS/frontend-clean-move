"use client";

import type { DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core/index.js";
import type { DayCellContentArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import FullCalendar from "@fullcalendar/react";
import { isSameDay as isSameDayDateFns } from "date-fns";
import { useMemo, useRef, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { cn } from "@/shared/utils/cn";

import styles from "../appointments-page.module.css";
import { useCalendarMoreLink } from "../../hooks/use-calendar-more-link";
import { useFullCalendarResize } from "../../hooks/use-full-calendar-resize";
import { useMonthCellIndicators } from "../../hooks/use-month-cell-indicators";
import { useSelectedCalendarEventPopover } from "../../hooks/use-selected-calendar-event-popover";
import { getCalendarEventClassNames } from "../../lib/appointments-page.helpers";
import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
  AppointmentExtendedProps,
} from "../../types/appointment-calendar";
import { CalendarEventContent } from "./calendar-event-content";
import { CalendarEventDetailsPopover } from "./calendar-event-details-popover";
import {
  appointmentsCalendarBusinessHours,
  appointmentsCalendarEventTimeFormat,
  appointmentsCalendarLocale,
  appointmentsCalendarPlugins,
  appointmentsCalendarSlotDuration,
  appointmentsCalendarSlotLabelFormat,
  appointmentsCalendarSlotMaxTime,
  appointmentsCalendarSlotMinTime,
  appointmentsCalendarViews,
} from "./appointments-calendar.config";
import { CalendarMoreLinkContent } from "./calendar-more-link-content";
import { CalendarSlotOverlay } from "./calendar-slot-overlay";

type AppointmentsCalendarProps = {
  calendarRef: RefObject<FullCalendar | null>;
  initialSelectedDate: Date;
  events: AppointmentCalendarEvent[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedDate: Date;
  selectedEventId: string | null;
  selectedEventPopoverId: string | null;
  selectedSlotKey: string | null;
  selectedView: AppointmentCalendarView;
  updatingStatusAppointmentId: string | null;
  onDateClick: (info: DateClickArg) => void;
  onDatesSet: (arg: DatesSetArg) => void;
  onEventClick: (info: EventClickArg) => void;
  onClearSelectedEvent: () => void;
  onMonthCellPress: (date: Date) => void;
  onSlotPress: (date: Date) => void;
  onCellAddIndicatorPress: (open: boolean) => void;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
};

export function AppointmentsCalendar({
  calendarRef,
  initialSelectedDate,
  events,
  isLoading,
  isError,
  onRetry,
  selectedDate,
  selectedEventId,
  selectedEventPopoverId,
  selectedSlotKey,
  selectedView,
  updatingStatusAppointmentId,
  onDateClick,
  onDatesSet,
  onEventClick,
  onClearSelectedEvent,
  onMonthCellPress,
  onSlotPress,
  onCellAddIndicatorPress,
  onStatusChange,
}: AppointmentsCalendarProps) {
  const { state: sidebarState } = useSidebar();
  const calendarResizeRef = useRef<HTMLDivElement | null>(null);
  const isMonthGridView = selectedView === "dayGridMonth";
  const fullCalendarEvents = useMemo<EventInput[]>(
    () =>
      events.map((event) => ({
        ...event,
        start: event.startsAt,
      })),
    [events],
  );
  const { handleMoreLinkDidMount, handleMoreLinkWillUnmount, handleMoreLinkClick } =
    useCalendarMoreLink();
  const selectedPopoverEvent =
    (selectedEventPopoverId ? events.find((event) => event.id === selectedEventPopoverId) : null) ??
    null;
  const {
    monthCellIndicatorPortals,
    handleMonthCellDidMount,
    handleMonthCellWillUnmount,
    renderMonthDayCellContent,
  } = useMonthCellIndicators({
    onMonthCellPress,
    onCellAddIndicatorPress,
  });

  useFullCalendarResize({
    calendarRef,
    resizeTargetRef: calendarResizeRef,
    calendarViewportHeight: null,
    selectedView,
    sidebarState,
  });
  const {
    hasSelectedEventAnchor,
    handleEventClickAnchor,
    handleEventDidMount,
    handleEventWillUnmount,
    popoverPlacement,
    popoverStyle,
    setPopoverElement,
  } = useSelectedCalendarEventPopover({
    containerRef: calendarResizeRef,
    selectedEventId: selectedEventPopoverId,
  });

  function handleCalendarEventClick(info: EventClickArg) {
    handleEventClickAnchor(info);
    onEventClick(info);
  }

  function renderDayCellContent(arg: DayCellContentArg) {
    if (arg.view.type.startsWith("timeGrid")) {
      return (
        <CalendarSlotOverlay
          date={arg.date}
          events={events}
          selectedSlotKey={selectedSlotKey}
          isDayView={arg.view.type === "timeGridDay"}
          onSlotPress={onSlotPress}
          onCellAddIndicatorPress={onCellAddIndicatorPress}
        />
      );
    }

    return renderMonthDayCellContent(arg);
  }

  function getDayCellClassNames(arg: DayCellContentArg) {
    if (arg.view.type === "dayGridMonth") {
      return [
        styles.monthDayCell,
        !arg.isOther && isSameDayDateFns(arg.date, selectedDate) ? styles.monthDayCellSelected : "",
      ];
    }

    return [];
  }

  return (
    <div
      className={cn(
        "scrollbar-clean rounded-2xl border border-border/70 bg-background/40",
        styles.calendarViewport,
      )}
    >
      <div
        ref={calendarResizeRef}
        className={cn("relative h-full overflow-hidden", styles.calendarFrame)}
      >
        {monthCellIndicatorPortals}
        {isError ? (
          <div className="flex h-full min-h-[28rem] flex-col items-center justify-center gap-3 px-6 text-center">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Não foi possível carregar os agendamentos.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Atualize os dados para tentar novamente.
              </p>
            </div>
            <Button variant="outline" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={appointmentsCalendarPlugins}
            locale={appointmentsCalendarLocale}
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
            slotDuration={appointmentsCalendarSlotDuration}
            slotLabelInterval="01:00:00"
            slotLabelFormat={appointmentsCalendarSlotLabelFormat}
            slotMinTime={appointmentsCalendarSlotMinTime}
            slotMaxTime={appointmentsCalendarSlotMaxTime}
            height="100%"
            expandRows={!isMonthGridView}
            eventTimeFormat={appointmentsCalendarEventTimeFormat}
            businessHours={appointmentsCalendarBusinessHours}
            views={appointmentsCalendarViews}
            dayCellContent={renderDayCellContent}
            dayCellDidMount={handleMonthCellDidMount}
            dayCellWillUnmount={handleMonthCellWillUnmount}
            dayCellClassNames={getDayCellClassNames}
            moreLinkContent={(arg) =>
              arg.view.type === "dayGridMonth" ? (
                <CalendarMoreLinkContent count={arg.num} />
              ) : (
                `+${arg.num}`
              )
            }
            moreLinkDidMount={handleMoreLinkDidMount}
            moreLinkWillUnmount={handleMoreLinkWillUnmount}
            moreLinkClick={handleMoreLinkClick}
            events={fullCalendarEvents}
            dateClick={onDateClick}
            eventClick={handleCalendarEventClick}
            eventDidMount={handleEventDidMount}
            eventWillUnmount={handleEventWillUnmount}
            datesSet={onDatesSet}
            eventContent={(arg) => (
              <CalendarEventContent
                arg={arg}
                onSlotPress={onSlotPress}
                onCellAddIndicatorPress={onCellAddIndicatorPress}
              />
            )}
            eventClassNames={(arg) => {
              const extendedProps = arg.event.extendedProps as AppointmentExtendedProps;

              return getCalendarEventClassNames({
                extendedProps,
                eventId: arg.event.id,
                selectedEventId,
              });
            }}
          />
        )}
        {isLoading ? (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-20 rounded-xl border border-border/70 bg-card/90 px-3 py-2 text-center text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            Carregando agendamentos...
          </div>
        ) : null}
        {selectedPopoverEvent && hasSelectedEventAnchor ? (
          <CalendarEventDetailsPopover
            event={selectedPopoverEvent}
            placement={popoverPlacement}
            popoverRef={setPopoverElement}
            style={popoverStyle}
            isUpdatingStatus={updatingStatusAppointmentId === selectedPopoverEvent.id}
            onClose={onClearSelectedEvent}
            onStatusChange={onStatusChange}
          />
        ) : null}
      </div>
    </div>
  );
}
