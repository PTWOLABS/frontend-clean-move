import { httpClient } from "@/shared/api/httpClient";

export async function deleteService(serviceId: string) {
  return httpClient<void>(`/services/${serviceId}`, {
    method: "DELETE",
  });
}
