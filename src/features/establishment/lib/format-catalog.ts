import { formatBrlFromCents } from "@/shared/money/format-brl-money";

const categoryLabels: Record<string, string> = {
  WASH: "Lavagem",
  ESTETICA: "Estética",
  DETAILING: "Detalhamento",
  INTERIOR: "Interior",
};

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

export function formatServiceCategory(category: string): string {
  return categoryLabels[category] ?? category;
}
