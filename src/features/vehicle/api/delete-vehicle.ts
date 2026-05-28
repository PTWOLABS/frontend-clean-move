import { httpClient } from "@/shared/api/httpClient";

export async function deleteVehicle(customerId: string, vehicleId: string) {
  return httpClient<null>(`/customers/${customerId}/vehicles/${vehicleId}`, {
    method: "DELETE",
  });
}
