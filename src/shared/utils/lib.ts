export function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

export function formatCompactCurrency(valueInCents: number) {
  return `R$ ${Math.round(valueInCents / 100000)}k`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}
