import { httpClient } from "@/shared/api/httpClient";

import type { CustomerVehicleDto } from "../types";

type GetVehicleByIdResponse = {
  vehicle: CustomerVehicleDto;
};

export async function getVehicleById(customerId: string, vehicleId: string, signal?: AbortSignal) {
  const response = await httpClient<GetVehicleByIdResponse>(
    `/customers/${customerId}/vehicles/${vehicleId}`,
    {
      signal,
    },
  );

  return response.vehicle;
}
