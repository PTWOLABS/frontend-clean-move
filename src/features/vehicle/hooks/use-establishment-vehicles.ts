"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { listEstablishmentVehicles } from "../api/list-establishment-vehicles";
import type { ListEstablishmentVehiclesQuery } from "../types";

export type UseEstablishmentVehiclesArgs = ListEstablishmentVehiclesQuery & {
  enabled?: boolean;
};

export function useEstablishmentVehicles({
  customerId,
  name,
  page = 1,
  size = 10,
  enabled = true,
}: UseEstablishmentVehiclesArgs) {
  return useQuery({
    queryKey: QUERY_KEYS.vehiclesAll({ customerId, name, page, size }),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      listEstablishmentVehicles({ customerId, name, page, size }, signal),
    enabled,
  });
}
