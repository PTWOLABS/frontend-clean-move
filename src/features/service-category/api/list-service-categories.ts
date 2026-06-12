import { httpClient } from "@/shared/api/httpClient";

import type {
  ListServiceCategoriesQuery,
  ListServiceCategoriesResponse,
} from "../types";

export async function listServiceCategories(
  filters?: ListServiceCategoriesQuery,
  signal?: AbortSignal,
) {
  return httpClient<ListServiceCategoriesResponse, ListServiceCategoriesQuery>(
    "/service-categories",
    { filters, signal },
  );
}
