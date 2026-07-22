import { useInfiniteQuery, type InfiniteData, type QueryKey } from "@tanstack/react-query";

type UseOptionsInfiniteQueryArgs<TItem, TPage> = {
  queryKey: QueryKey;
  queryFn: (args: { page: number; signal: AbortSignal }) => Promise<TPage>;
  getItems: (page: TPage) => TItem[];
  getTotalItems: (page: TPage) => number;
  enabled?: boolean;
  staleTime?: number;
  retry?: boolean | number;
};

export function useOptionsInfiniteQuery<TItem, TPage>({
  queryKey,
  queryFn,
  getItems,
  getTotalItems,
  enabled = true,
  staleTime,
  retry = false,
}: UseOptionsInfiniteQueryArgs<TItem, TPage>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => queryFn({ page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalItems = getTotalItems(lastPage);
      const loadedCount = allPages.reduce((acc, page) => acc + getItems(page).length, 0);
      return loadedCount < totalItems ? allPages.length + 1 : undefined;
    },
    enabled,
    staleTime,
    retry,
    select: (data: InfiniteData<TPage, number>) => {
      const items = data.pages.flatMap(getItems);
      const lastPage = data.pages.at(-1);
      const totalItems = lastPage ? getTotalItems(lastPage) : 0;

      return { items, totalItems };
    },
  });

  return {
    ...query,
    items: query.data?.items ?? [],
    totalItems: query.data?.totalItems ?? 0,
    hasMore: Boolean(query.hasNextPage),
  };
}
