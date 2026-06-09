"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { listServices } from "../api/list-services";
import type { ListServicesQuery } from "../types";

export type UseServicesArgs = ListServicesQuery & {
  establishmentId: string;
  enabled?: boolean;
};

export function useServices({
  establishmentId,
  enabled = true,
  page = 1,
  size = 5,
  name,
  isActive,
}: UseServicesArgs) {
  return useQuery({
    queryKey: QUERY_KEYS.services({ page, size, name, isActive }),
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      listServices(
        establishmentId,
        {
          page,
          size,
          name: name?.trim() ? name.trim() : undefined,
          isActive,
        },
        signal,
      ),
    enabled: enabled && Boolean(establishmentId),
  });
}
