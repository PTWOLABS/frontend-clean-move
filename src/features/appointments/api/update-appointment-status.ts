import { httpClient } from "@/shared/api/httpClient";
import { AppointmentStatus } from "@/shared/types/appointments";
import { UpdateAppointmentStatusDTO } from "../types/appointments-dto";

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  return await httpClient<UpdateAppointmentStatusDTO>(`/appointments/${appointmentId}/status`, {
    method: "PATCH",
    body: { status },
  });
}
