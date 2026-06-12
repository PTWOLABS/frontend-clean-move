import { formatBrlFromCents } from "@/shared/money/format-brl-money";

import type { ServiceCategoryRef } from "../types";

/**
 * Formata preço em BRL. Assume `amount` em **centavos** inteiros (ex.: 3000 → R$ 30,00).
 * Valores inválidos ou ausentes mostram R$ 0,00.
 * @see formatBrlFromCents em `@/shared/money/format-brl-money`
 */
export function formatServicePriceBrl(amount: unknown): string {
  return formatBrlFromCents(amount);
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
