import { httpClient } from "@/shared/api/httpClient";

import type { UpdateVehiclePayload, VehicleDto } from "../types";

type UpdateVehicleResponse = {
  vehicle: VehicleDto;
};

export async function updateVehicle(
  customerId: string,
  vehicleId: string,
  payload: UpdateVehiclePayload,
) {
  return httpClient<UpdateVehicleResponse>(`/customers/${customerId}/vehicles/${vehicleId}`, {
    method: "PATCH",
    body: payload,
  });
}
