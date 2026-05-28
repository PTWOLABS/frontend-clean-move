"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { getVehicleOptions } from "../api/get-vehicle-options";
import type { VehicleOptionsQuery } from "../types";

type UseVehicleOptionsArgs = VehicleOptionsQuery & {
  enabled?: boolean;
};

export function useVehicleOptions({
  search,
  customerId,
  limit,
  enabled = true,
}: UseVehicleOptionsArgs = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicleOptions({ search, customerId, limit }),
    queryFn: ({ signal }) => getVehicleOptions({ search, customerId, limit }, signal),
    enabled,
  });
}
