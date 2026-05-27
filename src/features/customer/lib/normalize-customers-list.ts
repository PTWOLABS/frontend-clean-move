import type { CustomersPage, ListCustomersResponse } from "../types";

export function normalizeCustomersList(
  body: ListCustomersResponse | null | undefined,
  page: number,
  size: number,
): CustomersPage {
  if (body == null) {
    return { items: [], total: 0, page, size };
  }

  const items = body.customers ?? [];
  const total =
    typeof body.totalItems === "number" && Number.isFinite(body.totalItems)
      ? body.totalItems
      : items.length;

  return { items, total, page, size };
}
