export function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

export function formatCompactCurrency(valueInCents: number) {
  const value = valueInCents / 100;

  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function buildQueryParamsFilters(
  filters?: Record<string, string | number | undefined>,
): string | undefined {
  if (!filters) return;

  const params = new URLSearchParams();

  for (const [filterName, filterValue] of Object.entries(filters)) {
    if (filterValue === undefined) continue;

    const value = filterValue.toString().trim();

    if (value) {
      params.append(filterName, value);
    }
  }

  const queryString = params.toString();

  return queryString && `?${queryString}`;
}

export function normalizeQueryParamsFilters<T extends object>(filters?: T): Record<string, string> {
  if (!filters) return {};

  const normalizedFilters: Record<string, string> = {};

  for (const [filterName, filterValue] of Object.entries(filters)) {
    if (filterValue !== undefined && filterValue !== null) {
      normalizedFilters[filterName] = String(filterValue).trim();
    }
  }

  return normalizedFilters;
}
