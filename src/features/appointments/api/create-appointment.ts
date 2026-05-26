import { httpClient } from "@/shared/api/httpClient";
import { CreateAppointmentFormInput } from "../schemas/create-appointment-schema";
import { AppointmentDTO } from "../types/appointments-dto";

export async function createAppointment(body: CreateAppointmentFormInput) {
  return await httpClient<AppointmentDTO>("/appointments", {
    body,
  });
}
