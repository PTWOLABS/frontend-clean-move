import { httpClient } from "@/shared/api/httpClient";

export async function deleteAppointment(appointmentId: string) {
  return httpClient<void>(`/appointments/${appointmentId}`, {
    method: "DELETE",
  });
}
