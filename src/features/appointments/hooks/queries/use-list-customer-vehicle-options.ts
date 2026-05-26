import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { useQuery } from "@tanstack/react-query";

import { VehicleOptionsFilters } from "../../types/api-filters";
import { listCustomerVehicleOptions } from "../../api/list-customer-vehicle-options";

export function useListCustomerVehicleOptions(filters?: VehicleOptionsFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicles(filters),
    queryFn: async () => listCustomerVehicleOptions(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
