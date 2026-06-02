import type { ListEstablishmentVehiclesQuery, VehicleSearchType } from "../types";

export function buildEstablishmentVehiclesFiltersFromSearch(
  searchType: VehicleSearchType,
  term: string,
  pagination: { page: number; size: number },
): ListEstablishmentVehiclesQuery {
  const filters: ListEstablishmentVehiclesQuery = {
    page: pagination.page,
    size: pagination.size,
  };

  const trimmed = term.trim();
  if (trimmed) {
    filters[searchType] = trimmed;
  }

  return filters;
}
