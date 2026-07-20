import { httpClient } from "@/shared/api/httpClient";

import type { VehicleOptionsListParams, VehicleOptionsResponse } from "../types";

export async function getVehicleOptions(
  params: VehicleOptionsListParams = {},
  signal?: AbortSignal,
): Promise<VehicleOptionsResponse> {
  return httpClient<VehicleOptionsResponse, VehicleOptionsListParams>("/vehicles/options", {
    filters: params,
    signal,
  });
}
