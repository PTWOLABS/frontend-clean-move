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
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("size", String(size));

  const path = `/customers/${customerId}/vehicles?${searchParams.toString()}`;
  const raw = await httpClient<ListVehiclesResponse>(path, { signal });
  return normalizeVehiclesList(raw, page, size);
}
