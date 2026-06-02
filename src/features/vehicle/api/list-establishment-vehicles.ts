import { httpClient } from "@/shared/api/httpClient";

import { buildEstablishmentVehiclesQueryParams } from "../lib/build-establishment-vehicles-query";
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
  const query = buildEstablishmentVehiclesQueryParams({ ...params, page, size }).toString();
  const path = `/vehicles?${query}`;

  const raw = await httpClient<ListVehiclesResponse>(path, { signal });
  return normalizeVehiclesList(raw, page, size);
}
