"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listEstablishmentServices } from "../api/list-establishment-services";
import type { ListEstablishmentServicesQuery } from "../types";

export type UseEstablishmentServicesArgs = ListEstablishmentServicesQuery & {
  ownerId: string;
  enabled?: boolean;
};

export function useEstablishmentServices({
  ownerId,
  enabled = true,
  page = 1,
  size = 5,
  name,
  isActive,
}: UseEstablishmentServicesArgs) {
  return useQuery({
    queryKey: ["establishments", ownerId, "services", { page, size, name, isActive }],
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      listEstablishmentServices(
        ownerId,
        {
          page,
          size,
          name: name?.trim() ? name.trim() : undefined,
          isActive,
        },
        signal,
      ),
    enabled: enabled && Boolean(ownerId),
  });
}
