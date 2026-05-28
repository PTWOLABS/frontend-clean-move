import { httpClient } from "@/shared/api/httpClient";

import type { CreateVehiclePayload, VehicleDto } from "../types";

type CreateVehicleResponse = {
  vehicle: VehicleDto;
};

export async function createVehicle(customerId: string, payload: CreateVehiclePayload) {
  return httpClient<CreateVehicleResponse>(`/customers/${customerId}/vehicles`, {
    method: "POST",
    body: payload,
  });
}
