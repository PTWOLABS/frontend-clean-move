import { httpClient } from "@/shared/api/httpClient";

import type { CustomerVehicleDto, UpdateCustomerVehiclePayload } from "../types";

type UpdateCustomerVehicleResponse = {
  vehicle: CustomerVehicleDto;
};

export async function updateCustomerVehicle(
  customerId: string,
  vehicleId: string,
  payload: UpdateCustomerVehiclePayload,
) {
  return httpClient<UpdateCustomerVehicleResponse>(`/customers/${customerId}/vehicles/${vehicleId}`, {
    method: "PATCH",
    body: payload,
  });
}
