const HH_MM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const DURATION_HHMM_MASK = "__:__";

export function minutesToHhMm(totalMinutes: number): string {
  const safe = Number.isFinite(totalMinutes) ? Math.max(0, Math.floor(totalMinutes)) : 0;
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  const clampedHours = Math.min(hours, 23);

  return `${String(clampedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function hhMmToMinutes(value: string): number | null {
  const trimmed = value.trim();
  const match = HH_MM_PATTERN.exec(trimmed);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

export function isValidDurationHhMm(value: string): boolean {
  const minutes = hhMmToMinutes(value);
  return minutes !== null && minutes >= 1;
}
