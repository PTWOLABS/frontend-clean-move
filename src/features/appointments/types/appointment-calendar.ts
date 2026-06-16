import type { EventInput } from "@fullcalendar/core/index.js";
import type { AppointmentStatus } from "@/shared/types/appointments";

export type AppointmentCalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

export type AppointmentTone = "primary" | "accent" | "success" | "warning" | "danger" | "info";

export type AppointmentVehicleExtendedProps = {
  plate: string;
  brand: string;
  model: string;
  displayName: string;
};

export type AppointmentExtendedProps = {
  customerId: string;
  customer: string;
  serviceIds: {
    value: string;
    label: string;
  }[];
  services?: {
    serviceId: string;
    label: string;
    priceInCents: number;
  }[];
  service: string;
  vehicleId: string;
  vehicle: AppointmentVehicleExtendedProps;
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
