import type { VehicleDto } from "../types";

export function formatVehicleName(vehicle?: VehicleDto | null): string {
  if (!vehicle) return "—";

  const model = [vehicle.brand, vehicle.model].filter(Boolean).join(" ").trim();
  if (model) return model;

  const plate = vehicle.plate?.trim();
  if (plate) return plate;

  return "—";
}

export function formatVehiclePlate(vehicle?: VehicleDto | null): string {
  return vehicle?.plate?.trim() || "—";
}

export function formatVehicleYear(vehicle?: VehicleDto | null): string {
  if (vehicle?.year == null) return "—";
  return String(vehicle.year);
}

const VEHICLE_COLOR_SWATCH: Record<string, string> = {
  azul: "bg-blue-500",
  vermelho: "bg-red-500",
  preto: "bg-foreground",
  branco: "bg-background ring-1 ring-border",
  prata: "bg-zinc-400",
  cinza: "bg-zinc-500",
  verde: "bg-green-500",
  amarelo: "bg-yellow-500",
  laranja: "bg-orange-500",
  marrom: "bg-amber-800",
  bege: "bg-amber-200",
  roxo: "bg-purple-500",
  rosa: "bg-pink-500",
};

export function getVehicleColorSwatchClass(color?: string | null): string {
  const key = color?.trim().toLowerCase() ?? "";
  return VEHICLE_COLOR_SWATCH[key] ?? "bg-primary";
}
