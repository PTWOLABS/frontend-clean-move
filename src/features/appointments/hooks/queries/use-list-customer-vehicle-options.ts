import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { DEFAULT_OPTIONS_SIZE } from "@/shared/constants/options";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { useOptionsInfiniteQuery } from "@/shared/hooks/use-options-infinite-query";

import { listCustomerVehicleOptions } from "../../api/list-customer-vehicle-options";
import type { VehicleOptionsFilters } from "../../types/api-filters";

export function useListCustomerVehicleOptions(filters?: VehicleOptionsFilters) {
  const size = filters?.size ?? DEFAULT_OPTIONS_SIZE;
  const search = filters?.search;
  const customerId = filters?.customerId;

  return useOptionsInfiniteQuery({
    queryKey: QUERY_KEYS.vehicleOptions({ size, search, customerId }),
    queryFn: ({ page, signal }) =>
      listCustomerVehicleOptions({ page, size, search, customerId }, signal),
    getItems: (page) => page.vehicles,
    getTotalItems: (page) => page.totalItems,
    enabled: Boolean(customerId),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
