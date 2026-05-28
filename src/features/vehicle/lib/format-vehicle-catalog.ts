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
