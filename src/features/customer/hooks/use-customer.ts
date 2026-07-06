"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { getCustomerById } from "../api/get-customer-by-id";

type UseCustomerArgs = {
  customerId?: string | null;
  enabled?: boolean;
};

export function useCustomer({ customerId, enabled = true }: UseCustomerArgs) {
  return useQuery({
    queryKey: QUERY_KEYS.customer(customerId ?? undefined),
    queryFn: ({ signal }) => {
      if (!customerId) {
        throw new Error("Customer id is required.");
      }

      return getCustomerById(customerId, signal);
    },
    enabled: enabled && Boolean(customerId),
  });
}
