"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { listEstablishmentVehicles } from "../api/list-establishment-vehicles";
import type { ListEstablishmentVehiclesQuery } from "../types";

export type UseEstablishmentVehiclesArgs = ListEstablishmentVehiclesQuery & {
  enabled?: boolean;
};

export function useEstablishmentVehicles({
  enabled = true,
  ...filters
}: UseEstablishmentVehiclesArgs) {
  return useQuery({
    queryKey: QUERY_KEYS.vehiclesAll(filters),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => listEstablishmentVehicles(filters, signal),
    enabled,
  });
}
