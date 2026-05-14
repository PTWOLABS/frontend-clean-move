const categoryLabels: Record<string, string> = {
  WASH: "Lavagem",
  ESTETICA: "Estética",
  DETAILING: "Detalhamento",
  INTERIOR: "Interior",
};

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Formata preço em BRL. Assume `amount` em **centavos** inteiros (ex.: 3000 → R$ 30,00).
 * Valores inválidos ou ausentes mostram R$ 0,00.
 */
export function formatServicePriceBrl(amount: unknown): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  const cents = Number.isFinite(n) ? n : 0;
  return priceFormatter.format(cents / 100);
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
