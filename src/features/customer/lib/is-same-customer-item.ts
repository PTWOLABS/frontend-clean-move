import type { CustomerWithPrimaryVehicle } from "../types";

export function isSameCustomerItem(
  a: CustomerWithPrimaryVehicle,
  b: CustomerWithPrimaryVehicle | null | undefined,
): boolean {
  if (!b) return false;
  return a.id === b.id;
}
