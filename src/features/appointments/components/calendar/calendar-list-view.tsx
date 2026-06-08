import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCallback } from "react";

import { cn } from "@/shared/utils/cn";

import styles from "../appointments-page.module.css";
import { formatAppointmentTimeRange } from "../../lib/appointments-page.helpers";
import { AppointmentCalendarEvent, AppointmentTone } from "../../types/appointment-calendar";

const calendarListToneClassName: Record<AppointmentTone, string> = {
  primary: styles.eventTonePrimary,
  accent: styles.eventToneAccent,
  success: styles.eventToneSuccess,
  warning: styles.eventToneWarning,
  danger: styles.eventToneDanger,
  info: styles.eventToneInfo,
};

function sortEventsByStart(left: AppointmentCalendarEvent, right: AppointmentCalendarEvent) {
  return left.startsAt.getTime() - right.startsAt.getTime();
}

type CalendarListViewProps = {
  events: AppointmentCalendarEvent[];
  selectedDate: Date;
  selectedEventId: string | null;
  isLoading: boolean;
  onEventAnchorChange?: (eventId: string, element: HTMLElement | null) => void;
  onSelectEvent: (event: AppointmentCalendarEvent) => void;
};

type CalendarListEventRowProps = {
  event: AppointmentCalendarEvent;
  isActive: boolean;
  onEventAnchorChange?: (eventId: string, element: HTMLElement | null) => void;
  onSelectEvent: (event: AppointmentCalendarEvent) => void;
};

function CalendarListEventRow({
  event,
  isActive,
  onEventAnchorChange,
  onSelectEvent,
}: CalendarListEventRowProps) {
  const setAnchorElement = useCallback(
    (element: HTMLButtonElement | null) => {
      onEventAnchorChange?.(event.id, element);
    },
    [event.id, onEventAnchorChange],
  );

  return (
    <div role="listitem">
      <button
        type="button"
        ref={setAnchorElement}
        data-cy={`calendar-list-event-${event.id}`}
        className={cn(styles.calendarListEventRow, isActive && styles.calendarListEventSelected)}
        onClick={() => onSelectEvent(event)}
      >
        <span className={styles.calendarListEventTime}>{formatAppointmentTimeRange(event)}</span>
        <span
          className={cn(
            styles.calendarListEventDot,
            calendarListToneClassName[event.extendedProps.tone],
          )}
          aria-hidden
        />
        <span className={styles.calendarListEventContent}>
          <span className={styles.calendarListEventTitle}>{event.title}</span>
          <span className={styles.calendarListEventMeta}>{event.extendedProps.customer}</span>
        </span>
      </button>
    </div>
  );
}

export function CalendarListView({
  events,
  selectedDate,
  selectedEventId,
  onEventAnchorChange,
  onSelectEvent,
  isLoading,
}: CalendarListViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_item, index) => addDays(weekStart, index));
  const dayGroups = days
    .map((day) => ({
      day,
      events: events.filter((event) => isSameDay(event.startsAt, day)).sort(sortEventsByStart),
    }))
    .filter((group) => group.events.length > 0);

  if (!dayGroups.length && !isLoading) {
    return (
      <div className={styles.calendarListEmptyState}>
        <p className="font-medium text-card-foreground">Nenhum agendamento nesta semana.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use o botão de novo agendamento para adicionar um horário.
        </p>
      </div>
    );
  }

  return (
    <div
      className={styles.calendarListView}
      role="list"
      aria-label="Agendamentos em lista"
      data-calendar-event-popover-scroll-container="true"
    >
      {dayGroups.map(({ day, events: dayEvents }) => (
        <section key={day.toISOString()} className={styles.calendarListDayGroup}>
          <header className={styles.calendarListDayHeader}>
            <span>{format(day, "EEEE", { locale: ptBR })}</span>
            <span>{format(day, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          </header>

          <div>
            {dayEvents.map((event) => {
              const isActive = selectedEventId === event.id;

              return (
                <CalendarListEventRow
                  key={event.id}
                  event={event}
                  isActive={isActive}
                  onEventAnchorChange={onEventAnchorChange}
                  onSelectEvent={onSelectEvent}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
