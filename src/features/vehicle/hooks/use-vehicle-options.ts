"use client";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { DEFAULT_OPTIONS_SIZE } from "@/shared/constants/options";
import { useOptionsInfiniteQuery } from "@/shared/hooks/use-options-infinite-query";

import { getVehicleOptions } from "../api/get-vehicle-options";
import type { VehicleOptionsQuery } from "../types";

type UseVehicleOptionsArgs = VehicleOptionsQuery & {
  enabled?: boolean;
};

export function useVehicleOptions({
  search,
  customerId,
  size,
  enabled = true,
}: UseVehicleOptionsArgs = {}) {
  const resolvedSize = size ?? DEFAULT_OPTIONS_SIZE;

  return useOptionsInfiniteQuery({
    queryKey: QUERY_KEYS.vehicleOptions({ search, customerId, size: resolvedSize }),
    queryFn: ({ page, signal }) =>
      getVehicleOptions({ search, customerId, size: resolvedSize, page }, signal),
    getItems: (page) => page.vehicles,
    getTotalItems: (page) => page.totalItems,
    enabled,
  });
}
