export function normalizeVehiclePlate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const normalized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  return normalized || undefined;
}
