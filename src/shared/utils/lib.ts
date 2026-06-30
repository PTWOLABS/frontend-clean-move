export function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

type NumericInputChangeEvent = {
  target: {
    value: string;
  };
};

type NumericInputChangeOptions = {
  formatAsCurrency?: boolean;
  showCurrencySymbol?: boolean;
};

const CURRENCY_SYMBOL_PATTERN = /^R\$\s?/;

export function getOnlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export function formatNumericInputValue(
  value: string,
  { formatAsCurrency = false, showCurrencySymbol = true }: NumericInputChangeOptions = {},
) {
  const numericValue = getOnlyNumbers(value);

  if (!numericValue) return "";
  if (!formatAsCurrency) return numericValue;

  const formattedCurrency = formatCurrency(Number(numericValue));

  return showCurrencySymbol
    ? formattedCurrency
    : formattedCurrency.replace(CURRENCY_SYMBOL_PATTERN, "");
}

export function handleNumericInputChange(
  event: NumericInputChangeEvent,
  onChange: (value: string) => void,
  options?: NumericInputChangeOptions,
) {
  onChange(formatNumericInputValue(event.target.value, options));
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

export function formatPercent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

type QueryParamPrimitive = string | number | boolean | Date;
type QueryParamValue =
  | QueryParamPrimitive
  | null
  | undefined
  | readonly (QueryParamPrimitive | null | undefined)[];
type NormalizedQueryParamValue = string | string[];

const API_LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?/;

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function parseApiDateTimeAsLocalDate(value: string) {
  const match = API_LOCAL_DATE_TIME_PATTERN.exec(value);

  if (!match) {
    return new Date(value);
  }

  const [, year, month, day, hour, minute, second = "0", millisecond = "0"] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(millisecond.slice(0, 3).padEnd(3, "0")),
  );
}

export function formatLocalDateTimeAsUtcISOString(value: Date) {
  return new Date(
    Date.UTC(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      value.getHours(),
      value.getMinutes(),
      value.getSeconds(),
      value.getMilliseconds(),
    ),
  ).toISOString();
}

function formatDateQueryParam(value: Date) {
  return formatLocalDateTimeAsUtcISOString(value);
}

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
        .map((item) => (isValidDate(item) ? formatDateQueryParam(item) : String(item).trim()));

      continue;
    }

    if (isValidDate(filterValue)) {
      normalizedFilters[filterName] = formatDateQueryParam(filterValue);

      continue;
    }

    normalizedFilters[filterName] = String(filterValue).trim();
  }

  return normalizedFilters;
}

export function getValidDate(value: unknown) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

export const onlyDigits = (value: string) => value.replace(/\D/g, "");
