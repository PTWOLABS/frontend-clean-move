"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { listCustomers } from "../api/list-customers";

type UseCustomersArgs = {
  search?: string;
  page?: number;
  size?: number;
  enabled?: boolean;
};

export function useCustomers({ search, page = 1, size = 10, enabled = true }: UseCustomersArgs) {
  return useQuery({
    queryKey: QUERY_KEYS.customers({ search, page, size }),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => listCustomers({ search, page, size }, signal),
    enabled,
  });
}
