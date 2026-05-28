import type { EventInput } from "@fullcalendar/core/index.js";
import type { AppointmentStatus } from "@/shared/types/appointments";

export type AppointmentCalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

export type AppointmentTone = "primary" | "accent" | "success" | "warning" | "danger" | "info";

export type AppointmentExtendedProps = {
  customerId: string;
  customer: string;
  serviceIds: {
    value: string;
    label: string;
  }[];
  service: string;
  vehicleId: string;
  vehicle: string;
  endsAt: Date | null;
  description: string;
  discountValue: string;
  notes: string;
  tone: AppointmentTone;
  status: AppointmentStatus;
};

export type AppointmentCalendarEvent = Omit<
  EventInput,
  "id" | "start" | "end" | "extendedProps"
> & {
  id: string;
  startsAt: Date;
  end: Date;
  extendedProps: AppointmentExtendedProps;
};
