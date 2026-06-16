import type { VehicleDto } from "../types";

export function isSameVehicleItem(a: VehicleDto, b: VehicleDto | null | undefined): boolean {
  if (!b) return false;
  return a.id === b.id;
}
