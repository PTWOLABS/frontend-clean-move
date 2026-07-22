import { httpClient } from "@/shared/api/httpClient";
import type { VehicleOptionsListParams } from "@/features/vehicle/types";

import type { VehicleOptionsDTO } from "../types/options-dto";

export async function listCustomerVehicleOptions(
  filters?: VehicleOptionsListParams,
  signal?: AbortSignal,
) {
  return await httpClient<VehicleOptionsDTO, VehicleOptionsListParams>("/vehicles/options", {
    filters,
    signal,
  });
}
