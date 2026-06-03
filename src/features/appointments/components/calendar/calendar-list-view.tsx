import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { AppointmentCalendarEvent, AppointmentTone } from "../../types/appointment-calendar";
import styles from '../appointments-page.module.css'
import { ptBR } from "date-fns/locale";
import { formatAppointmentTimeRange } from "../../lib/appointments-page.helpers";
import { cn } from "@/shared/utils/cn";

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
  onSelectEvent: (event: AppointmentCalendarEvent) => void;
};

export function CalendarListView({
  events,
  selectedDate,
  selectedEventId,
  onSelectEvent,
}: CalendarListViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_item, index) => addDays(weekStart, index));
  const dayGroups = days
    .map((day) => ({
      day,
      events: events
        .filter((event) => isSameDay(event.startsAt, day))
        .sort(sortEventsByStart),
    }))
    .filter((group) => group.events.length > 0);

  if (!dayGroups.length) {
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
    <div className={styles.calendarListView} role="list" aria-label="Agendamentos em lista">
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
                <div key={event.id} role="listitem">
                  <button
                    type="button"
                    data-cy={`calendar-list-event-${event.id}`}
                    className={cn(
                      styles.calendarListEventRow,
                      isActive && styles.calendarListEventSelected,
                    )}
                    onClick={() => onSelectEvent(event)}
                  >
                    <span className={styles.calendarListEventTime}>
                      {formatAppointmentTimeRange(event)}
                    </span>
                    <span
                      className={cn(
                        styles.calendarListEventDot,
                        calendarListToneClassName[event.extendedProps.tone],
                      )}
                      aria-hidden
                    />
                    <span className={styles.calendarListEventContent}>
                      <span className={styles.calendarListEventTitle}>{event.title}</span>
                      <span className={styles.calendarListEventMeta}>
                        {event.extendedProps.customer}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}