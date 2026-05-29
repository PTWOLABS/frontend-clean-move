import { httpClient } from "@/shared/api/httpClient";
import type { UpdateAppointmentRequestBody } from "../schemas/update-appointment-schema";
import type { UpdateAppointmentDTO } from "../types/appointments-dto";

export async function updateAppointment(appointmentId: string, body: UpdateAppointmentRequestBody) {
  return await httpClient<UpdateAppointmentDTO>(`/appointments/${appointmentId}`, {
    method: "PATCH",
    body,
  });
}
