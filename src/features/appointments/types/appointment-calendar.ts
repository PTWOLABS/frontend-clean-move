import type { EventInput } from "@fullcalendar/core/index.js";
import type { AppointmentStatus } from "@/shared/types/appointments";
import type { ResourceStatus } from "./appointments-dto";

export type AppointmentCalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

export type AppointmentTone = "primary" | "accent" | "success" | "warning" | "danger" | "info";

export type AppointmentVehicleExtendedProps = {
  plate: string;
  brand: string;
  model: string;
  displayName: string;
  currentResourceStatus?: ResourceStatus;
};

export type AppointmentExtendedProps = {
  customerId: string;
  customer: string;
  customerResourceStatus?: ResourceStatus;
  serviceIds: {
    value: string;
    label: string;
  }[];
  services?: {
    serviceId: string;
    label: string;
    priceInCents: number;
    currentResourceStatus?: ResourceStatus;
  }[];
  service: string;
  vehicleId: string;
  vehicle: AppointmentVehicleExtendedProps;
  endsAt: Date | null;
  description: string;
  discountValue: string;
  discountInCents?: number;
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
