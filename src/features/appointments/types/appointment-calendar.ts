import type { EventInput } from "@fullcalendar/core/index.js";
import type { AppointmentStatus } from "@/shared/types/appointments";

export type AppointmentCalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

export type AppointmentTone = "primary" | "accent" | "success" | "warning" | "danger" | "info";

export type AppointmentExtendedProps = {
  customer: string;
  service: string;
  vehicle: string;
  attendants: string[];
  notes: string;
  reminder: string;
  tone: AppointmentTone;
  status: AppointmentStatus;
};

export type AppointmentCalendarEvent = Omit<
  EventInput,
  "id" | "start" | "end" | "extendedProps"
> & {
  id: string;
  start: Date;
  end: Date;
  extendedProps: AppointmentExtendedProps;
};
