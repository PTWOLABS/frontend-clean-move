import { formatBrlFromCents } from "@/shared/money/format-brl-money";

import type { ServiceCategoryRef, ServicePriceSpecification } from "../types";

/**
 * Formata preço em BRL conforme modalidade.
 * @see formatBrlFromCents em `@/shared/money/format-brl-money`
 */
export function formatServicePriceBrl(priceSpecification: ServicePriceSpecification): string {
  if (priceSpecification.type === "FIXED") {
    return formatBrlFromCents(priceSpecification.fixedPriceInCents);
  }
  if (priceSpecification.type === "STARTING_AT") {
    return `A partir de ${formatBrlFromCents(priceSpecification.minPriceInCents)}`;
  }
  return `${formatBrlFromCents(priceSpecification.minPriceInCents)} - ${formatBrlFromCents(priceSpecification.maxPriceInCents)}`;
}

export function formatEstimatedDuration(minInMinutes: number, maxInMinutes: number): string {
  if (minInMinutes === maxInMinutes) {
    return `${minInMinutes} min`;
  }
  return `${minInMinutes}–${maxInMinutes} min`;
}

export function getServiceCategoryLabel(category: ServiceCategoryRef | null | undefined): string {
  return category?.name?.trim() || "—";
}

export function formatServiceCategory(category: ServiceCategoryRef | null | undefined): string {
  return getServiceCategoryLabel(category);
}
