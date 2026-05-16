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

type QueryParamPrimitive = string | number | boolean;
type QueryParamValue =
  | QueryParamPrimitive
  | null
  | undefined
  | readonly (QueryParamPrimitive | null | undefined)[];
type NormalizedQueryParamValue = string | string[];

function appendQueryParam(params: URLSearchParams, name: string, rawValue: unknown) {
  if (rawValue === undefined || rawValue === null) return;

  const value = String(rawValue).trim();

  if (value) {
    params.append(name, value);
  }
}

export function buildQueryParamsFilters(
  filters?: Record<string, QueryParamValue | NormalizedQueryParamValue>,
): string | undefined {
  if (!filters) return;

  const params = new URLSearchParams();

  for (const [filterName, filterValue] of Object.entries(filters)) {
    if (Array.isArray(filterValue)) {
      for (const item of filterValue) {
        appendQueryParam(params, filterName, item);
      }

      continue;
    }

    appendQueryParam(params, filterName, filterValue);
  }

  const queryString = params.toString();

  return queryString && `?${queryString}`;
}

export function normalizeQueryParamsFilters<T extends object>(
  filters?: T,
): Record<string, NormalizedQueryParamValue> {
  if (!filters) return {};

  const normalizedFilters: Record<string, NormalizedQueryParamValue> = {};

  for (const [filterName, filterValue] of Object.entries(filters)) {
    if (filterValue === undefined || filterValue === null) continue;

    if (Array.isArray(filterValue)) {
      normalizedFilters[filterName] = filterValue
        .filter((item) => item !== undefined && item !== null)
        .map((item) => String(item).trim());

      continue;
    }

    normalizedFilters[filterName] = String(filterValue).trim();
  }

  return normalizedFilters;
}
