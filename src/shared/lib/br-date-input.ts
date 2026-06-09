import { format, isValid, parse } from "date-fns";

const BR_DATE_FORMAT = "dd/MM/yyyy";
const ISO_DATE_FORMAT = "yyyy-MM-dd";

export function formatIsoDateToBr(iso: string): string {
  const trimmed = iso.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "";

  const date = parse(trimmed, ISO_DATE_FORMAT, new Date());
  if (!isValid(date)) return "";

  return format(date, BR_DATE_FORMAT);
}

export function parseBrDateToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = parse(trimmed, ISO_DATE_FORMAT, new Date());
    return isValid(date) ? trimmed : null;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const date = parse(trimmed, BR_DATE_FORMAT, new Date());
  if (!isValid(date)) return null;

  return format(date, ISO_DATE_FORMAT);
}
