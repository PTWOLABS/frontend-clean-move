"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { listVehicles } from "../api/list-vehicles";
import type { ListVehiclesQuery } from "../types";

export type UseVehiclesArgs = ListVehiclesQuery & {
  customerId: string;
  enabled?: boolean;
};

export function useVehicles({ customerId, enabled = true, page = 1, size = 10 }: UseVehiclesArgs) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicles(customerId, { page, size }),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => listVehicles(customerId, { page, size }, signal),
    enabled: enabled && Boolean(customerId),
  });
}
