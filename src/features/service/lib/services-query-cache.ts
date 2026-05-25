import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import type { ServiceItem, ServicesPage } from "../types";

export type ServicesListSnapshotEntry = {
  queryKey: QueryKey;
  data: ServicesPage | undefined;
};

export function getServicesListQueries(
  queryClient: QueryClient,
): Array<[QueryKey, ServicesPage | undefined]> {
  return queryClient.getQueriesData<ServicesPage>({
    queryKey: QUERY_KEYS.services(),
  });
}

export function snapshotServicesLists(queryClient: QueryClient): ServicesListSnapshotEntry[] {
  return getServicesListQueries(queryClient).map(([queryKey, data]) => ({
    queryKey,
    data,
  }));
}

export function removeServiceFromLists(queryClient: QueryClient, serviceId: string): void {
  for (const [queryKey, page] of getServicesListQueries(queryClient)) {
    if (!page) continue;
    const hadItem = page.items.some((item) => item.id === serviceId);
    if (!hadItem) continue;

    const next: ServicesPage = {
      ...page,
      items: page.items.filter((item) => item.id !== serviceId),
      total: Math.max(0, page.total - 1),
    };
    queryClient.setQueryData(queryKey, next);
  }
}

export function upsertServiceInLists(
  queryClient: QueryClient,
  serviceId: string,
  updater: (previous: ServiceItem | undefined) => ServiceItem,
): void {
  for (const [queryKey, page] of getServicesListQueries(queryClient)) {
    if (!page) continue;
    const index = page.items.findIndex((item) => item.id === serviceId);
    if (index === -1) continue;

    const previous = page.items[index];
    const nextItem = updater(previous);
    const items = [...page.items];
    items[index] = nextItem;

    queryClient.setQueryData(queryKey, { ...page, items });
  }
}

export function restoreServicesLists(
  queryClient: QueryClient,
  snapshot: ServicesListSnapshotEntry[] | undefined,
): void {
  if (!snapshot) return;
  for (const { queryKey, data } of snapshot) {
    if (data === undefined) {
      queryClient.removeQueries({ queryKey, exact: true });
    } else {
      queryClient.setQueryData(queryKey, data);
    }
  }
}
