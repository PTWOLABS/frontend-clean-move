import { httpClient } from "@/shared/api/httpClient";
import { CreateAppointmentRequestBody } from "../schemas/create-appointment-schema";
import { AppointmentDTO } from "../types/appointments-dto";

export async function createAppointment(body: CreateAppointmentRequestBody) {
  return await httpClient<AppointmentDTO>("/appointments", {
    body,
    method: "POST",
  });
}
