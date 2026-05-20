"use client";

import type { DayCellContentArg } from "@fullcalendar/core/index.js";
import FullCalendar from "@fullcalendar/react";
import { isSameDay as isSameDayDateFns } from "date-fns";
import { useRef } from "react";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/shared/utils/cn";

import { useAppointmentsPage } from "../../contexts/appointments-page-context";
import styles from "../appointments-page.module.css";
import type { AppointmentExtendedProps } from "../../types/appointment-calendar";
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
import { useCalendarMoreLink } from "../../hooks/use-calendar-more-link";
import { useCalendarViewportHeight } from "../../hooks/use-calendar-viewport-height";
import { useFullCalendarResize } from "../../hooks/use-full-calendar-resize";
import { useMonthCellIndicators } from "../../hooks/use-month-cell-indicators";
import { getCalendarEventClassNames } from "../../lib/appointments-page.helpers";
import { CalendarEventContent } from "./calendar-event-content";

export function AppointmentsCalendar() {
  const { state: sidebarState } = useSidebar();
  const {
    calendarRef,
    events,
    initialSelectedDate,
    selectedDate,
    selectedEventId,
    selectedSlotKey,
    selectedView,
    handleDateClick,
    handleDatesSet,
    handleEventClick,
    handleMonthCellPress,
    handleSlotPress,
  } = useAppointmentsPage();
  const calendarViewportRef = useRef<HTMLDivElement | null>(null);
  const calendarResizeRef = useRef<HTMLDivElement | null>(null);
  const isMonthGridView = selectedView === "dayGridMonth";
  const { calendarViewportHeight, isCalendarViewportReady } = useCalendarViewportHeight({
    viewportRef: calendarViewportRef,
    selectedView,
    sidebarState,
  });
  const shouldUseViewportHeight = !isMonthGridView && isCalendarViewportReady;
  const {
    calendarFrameStyle,
    isMorePopoverAlignedRight,
    handleMoreLinkDidMount,
    handleMoreLinkWillUnmount,
    handleMoreLinkClick,
  } = useCalendarMoreLink();
  const {
    monthCellIndicatorPortals,
    handleMonthCellDidMount,
    handleMonthCellWillUnmount,
    renderMonthDayCellContent,
  } = useMonthCellIndicators({
    onMonthCellPress: handleMonthCellPress,
  });

  useFullCalendarResize({
    calendarRef,
    resizeTargetRef: calendarResizeRef,
    calendarViewportHeight,
    selectedView,
    sidebarState,
  });

  function renderDayCellContent(arg: DayCellContentArg) {
    if (arg.view.type.startsWith("timeGrid")) {
      return (
        <CalendarSlotOverlay
          date={arg.date}
          events={events}
          selectedSlotKey={selectedSlotKey}
          onSlotPress={handleSlotPress}
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
      ref={calendarViewportRef}
      className={cn(
        "rounded-2xl border border-border/70 bg-background/40",
        !isCalendarViewportReady ? "min-h-[32rem]" : "min-h-0",
        isMonthGridView && styles.calendarViewportMonthGrid,
        styles.calendarViewport,
      )}
      style={
        shouldUseViewportHeight
          ? {
              height: `${calendarViewportHeight}px`,
            }
          : undefined
      }
    >
      <div
        ref={calendarResizeRef}
        className={cn(
          isMonthGridView ? "overflow-visible" : "h-full overflow-hidden",
          styles.calendarFrame,
          isMonthGridView && styles.calendarFrameMonthGrid,
          isMorePopoverAlignedRight && styles.morePopoverAlignRight,
        )}
        style={calendarFrameStyle}
      >
        {monthCellIndicatorPortals}
        {isCalendarViewportReady ? (
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
            height={isMonthGridView ? "auto" : "100%"}
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
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            eventContent={(arg) => <CalendarEventContent arg={arg} />}
            eventClassNames={(arg) => {
              const extendedProps = arg.event.extendedProps as AppointmentExtendedProps;

              return getCalendarEventClassNames({
                extendedProps,
                eventId: arg.event.id,
                selectedEventId,
              });
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
