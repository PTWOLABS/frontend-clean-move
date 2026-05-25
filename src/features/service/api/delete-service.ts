import { httpClient } from "@/shared/api/httpClient";

export async function deleteService(serviceId: string) {
  return httpClient<unknown>(`/services/${serviceId}`, {
    method: "DELETE",
  });
}
