import { httpClient } from "@/shared/api/httpClient";

import type { VehicleOptionsQuery, VehicleOptionsResponse } from "../types";

export async function getVehicleOptions(
  params: VehicleOptionsQuery = {},
  signal?: AbortSignal,
): Promise<VehicleOptionsResponse> {
  const searchParams = new URLSearchParams();
  if (params.search?.trim()) searchParams.set("search", params.search.trim());
  if (params.customerId) searchParams.set("customerId", params.customerId);
  if (params.limit != null) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const path = query ? `/vehicles/options?${query}` : "/vehicles/options";

  return httpClient<VehicleOptionsResponse>(path, { signal });
}
