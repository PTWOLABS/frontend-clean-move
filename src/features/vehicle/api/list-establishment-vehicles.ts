import { httpClient } from "@/shared/api/httpClient";

import { normalizeVehiclesList } from "../lib/normalize-vehicles-list";
import type {
  ListEstablishmentVehiclesQuery,
  ListVehiclesResponse,
  VehiclesPage,
} from "../types";

export async function listEstablishmentVehicles(
  params: ListEstablishmentVehiclesQuery = {},
  signal?: AbortSignal,
): Promise<VehiclesPage> {
  const page = params.page ?? 1;
  const size = params.size ?? 10;
  const searchParams = new URLSearchParams();

  if (params.customerId?.trim()) searchParams.set("customerId", params.customerId.trim());
  if (params.name?.trim()) searchParams.set("name", params.name.trim());
  searchParams.set("page", String(page));
  searchParams.set("size", String(size));

  const query = searchParams.toString();
  const path = `/vehicles?${query}`;

  const raw = await httpClient<ListVehiclesResponse>(path, { signal });
  return normalizeVehiclesList(raw, page, size);
}
