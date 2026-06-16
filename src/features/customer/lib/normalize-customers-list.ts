import type {
  CustomerDto,
  CustomersPage,
  CustomerWithPrimaryVehicle,
  ListCustomersResponse,
} from "../types";

function mapCustomerToListItem(customer: CustomerDto): CustomerWithPrimaryVehicle {
  return {
    ...customer,
    primaryVehicle: customer.vehicles?.[0] ?? null,
  };
}

export function normalizeCustomersList(
  body: ListCustomersResponse | null | undefined,
  page: number,
  size: number,
): CustomersPage {
  if (body == null) {
    return { items: [], total: 0, page, size };
  }

  const items = (body.customers ?? []).map(mapCustomerToListItem);
  const total =
    typeof body.totalItems === "number" && Number.isFinite(body.totalItems)
      ? body.totalItems
      : items.length;

  return { items, total, page, size };
}
