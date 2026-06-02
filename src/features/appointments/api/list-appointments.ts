import { httpClient } from "@/shared/api/httpClient";
import { AppointmentDTO } from "../types/appointments-dto";
import { AppointmentsFilters } from "../types/api-filters";

export async function listAppointments(filters?: AppointmentsFilters) {
  return await httpClient<AppointmentDTO, AppointmentsFilters>("/appointments", {
    filters,
  });
}
