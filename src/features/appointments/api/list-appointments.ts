import { httpClient } from "@/shared/api/httpClient";
import { AppointmentsFilters } from "../types/api-filters";
import { AppointmentDTO } from "../types/appointments-dto";

export async function listAppointments(filters?: AppointmentsFilters) {
  return await httpClient<AppointmentDTO, AppointmentsFilters>("/appointments", {
    filters,
  });
}
