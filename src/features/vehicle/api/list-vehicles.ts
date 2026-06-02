import { httpClient } from "@/shared/api/httpClient";

import { normalizeVehiclesList } from "../lib/normalize-vehicles-list";
import type { ListVehiclesQuery, ListVehiclesResponse, VehiclesPage } from "../types";

export async function listVehicles(
  customerId: string,
  params: ListVehiclesQuery = {},
  signal?: AbortSignal,
): Promise<VehiclesPage> {
  const page = params.page ?? 1;
  const size = params.size ?? 10;
  const raw = await httpClient<ListVehiclesResponse, ListVehiclesQuery>(
    `/customers/${customerId}/vehicles`,
    {
      signal,
      filters: { page, size },
    },
  );
  return normalizeVehiclesList(raw, page, size);
}
