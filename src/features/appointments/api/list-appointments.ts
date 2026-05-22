import { httpClient } from "@/shared/api/httpClient";
import { AppointmentsCalendarFilters } from "../types/api-filters";
import { AppointmentDTO } from "../types/appointments-dto";

export async function listAppointments(filters?: AppointmentsCalendarFilters) {
  return await httpClient<AppointmentDTO, AppointmentsCalendarFilters>("/appointments/calendar", {
    filters,
  });
}
