import { httpClient } from "@/shared/api/httpClient";

import { normalizeCustomersList } from "../lib/normalize-customers-list";
import type { CustomersPage, ListCustomersQuery, ListCustomersResponse } from "../types";

export async function listCustomers(
  params: ListCustomersQuery = {},
  signal?: AbortSignal,
): Promise<CustomersPage> {
  const page = params.page ?? 1;
  const size = params.size ?? 10;
  const searchParams = new URLSearchParams();

  if (params.search?.trim()) searchParams.set("search", params.search.trim());
  searchParams.set("page", String(page));
  searchParams.set("size", String(size));

  const query = searchParams.toString();
  const path = `/customers?${query}`;

  const raw = await httpClient<ListCustomersResponse>(path, { signal });
  return normalizeCustomersList(raw, page, size);
}
