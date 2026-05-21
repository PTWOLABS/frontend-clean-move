import { httpClient } from "@/shared/api/httpClient";

export async function createAppointment() {
  return await httpClient("/appointments");
}
