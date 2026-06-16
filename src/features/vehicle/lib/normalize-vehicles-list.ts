import type { ListVehiclesResponse, VehiclesPage } from "../types";

export function normalizeVehiclesList(
  body: ListVehiclesResponse | null | undefined,
  page: number,
  size: number,
): VehiclesPage {
  if (body == null) {
    return { items: [], total: 0, page, size };
  }

  const items = body.vehicles ?? [];
  const total =
    typeof body.totalItems === "number" && Number.isFinite(body.totalItems)
      ? body.totalItems
      : items.length;

  return { items, total, page, size };
}
