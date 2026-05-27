"use client";

import { useQueries } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { listCustomerVehicles } from "../api/list-customer-vehicles";

export function useCustomerVehicles(customerIds: string[]) {
  return useQueries({
    queries: customerIds.map((customerId) => ({
      queryKey: QUERY_KEYS.customerVehicles(customerId, { page: 1, size: 1 }),
      queryFn: ({ signal }) => listCustomerVehicles(customerId, { page: 1, size: 1 }, signal),
      enabled: Boolean(customerId),
    })),
  });
}
