import { format, isValid, parse } from "date-fns";

export const APP_TIME_ZONE = "America/Sao_Paulo";

const BR_DATE_FORMAT = "dd/MM/yyyy";
const ISO_DATE_FORMAT = "yyyy-MM-dd";

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

function getDateTimeFormatter(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    ...options,
  });
}

function getDateKeyFormatter() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getDateTimePartsFormatter() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
}

function parseCivilDateInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = parse(trimmed, ISO_DATE_FORMAT, new Date());
    return isValid(date) ? date : null;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const date = parse(trimmed, BR_DATE_FORMAT, new Date());
  return isValid(date) ? date : null;
}

function getZonedDateTimeParts(date: Date): DateTimeParts {
  const values = getDateTimePartsFormatter()
    .formatToParts(date)
    .reduce<Record<string, string>>((parts, part) => {
      if (part.type !== "literal") {
        parts[part.type] = part.value;
      }

      return parts;
    }, {});

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    millisecond: date.getMilliseconds(),
  };
}

function dateTimePartsAsUtcTimestamp(parts: DateTimeParts) {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
}

function zonedDateTimePartsToUtcDate(parts: DateTimeParts) {
  const utcGuess = dateTimePartsAsUtcTimestamp(parts);
  const zonedParts = getZonedDateTimeParts(new Date(utcGuess));
  const zoneOffset = dateTimePartsAsUtcTimestamp(zonedParts) - utcGuess;

  return new Date(utcGuess - zoneOffset);
}

export function getDateKeyInSaoPaulo(date: Date) {
  const values = getDateKeyFormatter()
    .formatToParts(date)
    .reduce<Record<string, string>>((parts, part) => {
      if (part.type !== "literal") {
        parts[part.type] = part.value;
      }

      return parts;
    }, {});

  return `${values.year}-${values.month}-${values.day}`;
}

export function formatDateBR(value: string | Date) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const date = parseCivilDateInput(value);
    return date ? format(date, BR_DATE_FORMAT) : "";
  }

  const date = new Date(value);
  if (!isValid(date)) return "";

  return getDateTimeFormatter({
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatShortDateBR(value: string | Date) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const date = parseCivilDateInput(value);
    return date ? format(date, "dd/MM") : "";
  }

  const date = new Date(value);
  if (!isValid(date)) return "";

  return getDateTimeFormatter({
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function formatIsoDateToBr(iso: string): string {
  const trimmed = iso.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = parseCivilDateInput(trimmed);
    return date ? format(date, BR_DATE_FORMAT) : "";
  }

  const date = new Date(trimmed);
  return isValid(date) ? formatDateBR(date) : "";
}

export function parseBrDateToIso(value: string): string | null {
  const date = parseCivilDateInput(value);
  return date ? format(date, ISO_DATE_FORMAT) : null;
}

export function dateInputValueToStartOfDayPayload(dateInputValue: string) {
  const date = parseCivilDateInput(dateInputValue);
  if (!date) return null;

  return zonedDateTimePartsToUtcDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  }).toISOString();
}

export function dateInputValueToEndOfDayPayload(dateInputValue: string) {
  const date = parseCivilDateInput(dateInputValue);
  if (!date) return null;

  return zonedDateTimePartsToUtcDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  }).toISOString();
}

export function dateToInputValue(date: Date | undefined) {
  if (!date || !isValid(date)) return undefined;

  return format(date, ISO_DATE_FORMAT);
}
