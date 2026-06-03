import { addMinutes, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { AppointmentStatus } from "@/shared/types/appointments";

import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
  AppointmentExtendedProps,
  AppointmentTone,
} from "../types/appointment-calendar";
import styles from "../components/appointments-page.module.css";

export const viewOptions: Array<{
  label: string;
  value: AppointmentCalendarView;
}> = [
  {
    label: "Visualização: Mês",
    value: "dayGridMonth",
  },
  {
    label: "Visualização: Semana",
    value: "timeGridWeek",
  },
  {
    label: "Visualização: Dia",
    value: "timeGridDay",
  },
  {
    label: "Visualização: Lista",
    value: "listWeek",
  },
];

export const compactViewOptions = viewOptions.filter((option) => option.value !== "timeGridWeek");

export const viewToggleOptions: Array<{
  label: string;
  value: AppointmentCalendarView;
}> = [
  {
    label: "Mês",
    value: "dayGridMonth",
  },
  {
    label: "Semana",
    value: "timeGridWeek",
  },
  {
    label: "Dia",
    value: "timeGridDay",
  },
  {
    label: "Lista",
    value: "listWeek",
  },
];

export const compactViewToggleOptions = viewToggleOptions.filter(
  (option) => option.value !== "timeGridWeek",
);

export const statusBadgeClassName: Record<AppointmentStatus, string> = {
  DONE: "border-transparent bg-success-soft text-success-soft-foreground",
  SCHEDULED: "border-transparent bg-info-soft text-info-soft-foreground",
  CANCELLED: "border-transparent bg-danger-soft text-danger-soft-foreground",
};

const toneContainerClassName: Record<AppointmentTone, string> = {
  primary: styles.eventTonePrimary,
  accent: styles.eventToneAccent,
  success: styles.eventToneSuccess,
  warning: styles.eventToneWarning,
  danger: styles.eventToneDanger,
  info: styles.eventToneInfo,
};

export const SLOT_DURATION = "00:30:00";
export const SLOT_DURATION_MINUTES = 30;
export const SLOT_MIN_TIME = "01:00:00";
export const SLOT_MAX_TIME = "24:00:00";
export const SLOT_START_HOUR = 1;
export const SLOT_END_HOUR = 24;
export const SLOT_COUNT = ((SLOT_END_HOUR - SLOT_START_HOUR) * 60) / SLOT_DURATION_MINUTES;
export const CALENDAR_VIEWPORT_BOTTOM_OFFSET = 24;

export const navigationCalendarClassNames = {
  root: "w-full",
  months: "w-full",
  month: "relative flex w-full flex-col gap-4",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  month_caption: "flex h-8 items-center justify-center px-10",
  caption_label: "text-sm font-semibold capitalize text-card-foreground",
  button_previous:
    "absolute left-0 top-0 inline-flex size-8 items-center justify-center rounded-xl border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:bg-accent/20 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  button_next:
    "absolute right-0 top-0 inline-flex size-8 items-center justify-center rounded-xl border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:bg-accent/20 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  month_grid: "w-full table-fixed border-separate border-spacing-y-1.5",
  weekdays: "grid w-full grid-cols-7",
  week: "mt-1.5 grid w-full grid-cols-7",
  weekday:
    "flex h-8 w-full items-center justify-center text-[0.72rem] font-medium lowercase tracking-[0.04em] text-muted-foreground",
  day: "relative flex h-9 w-full items-center justify-center p-0 text-center text-sm [&.outside]:text-muted-foreground [&.outside]:opacity-50 [&.selected>button]:bg-primary [&.selected>button]:text-primary-foreground [&.selected>button]:hover:bg-primary [&.selected>button]:hover:text-primary-foreground [&.today>button]:ring-1 [&.today>button]:ring-accent/80 [&.today>button]:ring-offset-2 [&.today>button]:ring-offset-background [&.today:not(.selected)>button]:bg-accent/20 [&.today:not(.selected)>button]:font-semibold [&.today:not(.selected)>button]:text-accent-foreground",
  day_button:
    "inline-flex size-9 items-center justify-center rounded-sm p-0 text-sm font-normal leading-none transition-colors hover:bg-accent/20 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
};

export function formatAppointmentTimeRange(event: AppointmentCalendarEvent) {
  return `${format(event.startsAt, "HH:mm", { locale: ptBR })} - ${format(event.end, "HH:mm", {
    locale: ptBR,
  })}`;
}

export function formatSlotKey(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function formatDayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function normalizeCalendarDate(date: Date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function buildSlotDate(date: Date, slotIndex: number) {
  return addMinutes(startOfDay(date), SLOT_START_HOUR * 60 + slotIndex * SLOT_DURATION_MINUTES);
}

export function doesEventOverlapSlot(
  event: AppointmentCalendarEvent,
  slotStart: Date,
  slotEnd: Date,
) {
  return event.startsAt.getTime() < slotEnd.getTime() && event.end.getTime() > slotStart.getTime();
}

export function getCalendarEventClassNames({
  extendedProps,
  eventId,
  selectedEventId,
}: {
  extendedProps: AppointmentExtendedProps;
  eventId: string;
  selectedEventId: string | null;
}) {
  return [
    styles.eventCard,
    toneContainerClassName[extendedProps.tone],
    eventId === selectedEventId ? styles.eventSelected : "",
  ];
}
