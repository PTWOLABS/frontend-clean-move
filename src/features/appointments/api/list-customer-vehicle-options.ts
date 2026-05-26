import { httpClient } from "@/shared/api/httpClient";
import { VehicleOptionsFilters } from "../types/api-filters";
import { VehicleOptionsDTO } from "../types/options-dto";

export async function listCustomerVehicleOptions(filters?: VehicleOptionsFilters) {
  return await httpClient<VehicleOptionsDTO, VehicleOptionsFilters>("/vehicles/options", {
    filters,
  });
}
