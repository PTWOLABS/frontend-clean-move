"use client";

import { useMemo } from "react";

import { useQueries } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { listEstablishmentVehicles } from "../api/list-establishment-vehicles";

const COUNT_STALE_TIME_MS = 60_000;

export function useCustomerVehicleCounts(customerIds: string[]) {
  const uniqueIds = useMemo(() => [...new Set(customerIds.filter(Boolean))], [customerIds]);

  const queries = useQueries({
    queries: uniqueIds.map((customerId) => ({
      queryKey: QUERY_KEYS.vehiclesAll({ customerId, page: 1, size: 1 }),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        listEstablishmentVehicles({ customerId, page: 1, size: 1 }, signal),
      staleTime: COUNT_STALE_TIME_MS,
    })),
  });

  const countsByCustomerId = useMemo(() => {
    const map = new Map<string, number>();

    uniqueIds.forEach((customerId, index) => {
      const total = queries[index]?.data?.total;
      if (typeof total === "number" && Number.isFinite(total)) {
        map.set(customerId, total);
      }
    });

    return map;
  }, [queries, uniqueIds]);

  const isLoading = queries.some((query) => query.isLoading);

  return { countsByCustomerId, isLoading };
}
