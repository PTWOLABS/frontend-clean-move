import type { ServiceItem } from "../types";

export function isSameServiceItem(a: ServiceItem, b: ServiceItem | null | undefined): boolean {
  if (!b) return false;
  if (a.id && b.id) return a.id === b.id;
  return a.serviceName === b.serviceName && a.category === b.category;
}
