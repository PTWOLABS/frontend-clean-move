import type { ListEstablishmentVehiclesQuery } from "../types";

const VEHICLE_FILTER_PARAM_KEYS = [
  "plate",
  "name",
  "model",
  "brand",
  "color",
  "year",
  "customerId",
] as const satisfies readonly (keyof ListEstablishmentVehiclesQuery)[];

export function buildEstablishmentVehiclesQueryParams(
  filters: ListEstablishmentVehiclesQuery,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const key of VEHICLE_FILTER_PARAM_KEYS) {
    const value = filters[key]?.trim();
    if (value) params.set(key, value);
  }

  const page = filters.page ?? 1;
  const size = filters.size ?? 10;
  params.set("page", String(page));
  params.set("size", String(size));

  return params;
}
