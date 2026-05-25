import type { EventContentArg } from "@fullcalendar/core/index.js";
import { differenceInMinutes } from "date-fns";

import { cn } from "@/shared/utils/cn";

import styles from "../appointments-page.module.css";
import type { AppointmentExtendedProps, AppointmentTone } from "../../types/appointment-calendar";

const toneDotClassName: Record<AppointmentTone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export function CalendarEventContent({ arg }: { arg: EventContentArg }) {
  const extendedProps = arg.event.extendedProps as AppointmentExtendedProps;
  const isMonthView = arg.view.type === "dayGridMonth";
  const durationInMinutes =
    arg.event.start && arg.event.end ? differenceInMinutes(arg.event.end, arg.event.start) : null;

  if (isMonthView) {
    return (
      <div className={styles.monthEventContent}>
        <span className={styles.monthEventTitle}>{arg.event.title}</span>
        <span className={styles.monthEventTime}>{arg.timeText}</span>
      </div>
    );
  }

  const shouldShowMeta = durationInMinutes === null || durationInMinutes >= 60;
  const isCompactTimeGridEvent = durationInMinutes !== null && durationInMinutes < 60;
  const timeLabel = arg.timeText || "Dia inteiro";

  if (isCompactTimeGridEvent) {
    return (
      <div className={cn(styles.eventContent, styles.eventContentCompact)}>
        <span className={styles.eventCompactTitle}>
          <span className={styles.eventCompactTime}>{timeLabel}</span>
          <span className={styles.eventCompactName}>{arg.event.title}</span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "size-2 rounded-full",
            styles.eventToneDot,
            styles.eventToneDotCompact,
            toneDotClassName[extendedProps.tone],
          )}
        />
      </div>
    );
  }

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
