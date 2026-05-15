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

export function buildQueryParamsFilters(
  filters?: Record<string, string | number>,
): string | undefined {
  if (!filters) return;

  const params = new URLSearchParams();

  for (const [filterName, filterValue] of Object.entries(filters)) {
    const value = filterValue.toString().trim();

    if (value) {
      params.append(filterName, value);
    }
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : undefined;
}
export function normalizeQueryParamsFilters<T extends object>(
  filters?: T,
): Partial<Record<keyof T, string>> {
  if (!filters) return {};

  const normalizedFilters = {} as Partial<Record<keyof T, string>>;

  for (const [filterName, filterValue] of Object.entries(filters) as [keyof T, T[keyof T]][]) {
    if (filterValue !== undefined && filterValue !== null) {
      normalizedFilters[filterName] = String(filterValue).trim();
    }
  }

  return normalizedFilters;
}
