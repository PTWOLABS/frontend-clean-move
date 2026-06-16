import { AppointmentsFilters } from "@/features/appointments/types/api-filters";

export type AppointmentStatus = "DONE" | "SCHEDULED" | "CANCELLED";

export type AppointmentCategories =
  | "WASH"
  | "SANITIZATION"
  | "ATOMATIVE_DETAILING"
  | "PROTECTION"
  | "UPHOLSTERY";

export type AppointmentsQueryKeyParams = {
  filters?: AppointmentsFilters;
  appointmentId?: string;
};
