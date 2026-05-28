import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { SLOT_DURATION, SLOT_MAX_TIME, SLOT_MIN_TIME } from "../../lib/appointments-page.helpers";

export const appointmentsCalendarLocale = ptBrLocale;

export const appointmentsCalendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];

export const appointmentsCalendarSlotDuration = SLOT_DURATION;
export const appointmentsCalendarSlotMinTime = SLOT_MIN_TIME;
export const appointmentsCalendarSlotMaxTime = SLOT_MAX_TIME;

export const appointmentsCalendarSlotLabelFormat = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
} as const;

export const appointmentsCalendarEventTimeFormat = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
} as const;

export const appointmentsCalendarBusinessHours = {
  daysOfWeek: [1, 2, 3, 4, 5, 6],
  startTime: "08:00",
  endTime: "18:30",
};

export const appointmentsCalendarViews = {
  dayGridMonth: {
    fixedWeekCount: true,
    showNonCurrentDates: true,
    dayMaxEvents: 2,
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
} as const;
