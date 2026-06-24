import { buildVehicleDisplayName } from "@/features/vehicle/lib/format-vehicle-catalog";

import type { CustomerDto, CustomerVehicleDto } from "../types";

export function formatCpfCnpj(value?: string | null): string {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  return value;
}

export function formatOptionalContact(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "-";
}

export function formatPhone(value?: string | null): string {
  if (!value?.trim()) return "-";

  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return value;
}

export function formatVehicleName(vehicle?: CustomerVehicleDto | null): string {
  if (!vehicle) return "Sem veículo";
  return buildVehicleDisplayName(vehicle);
}

export function getCustomerVehiclesCount(
  customer: Pick<CustomerDto, "vehicles" | "vehiclesCount">,
): number {
  if (typeof customer.vehiclesCount === "number" && customer.vehiclesCount >= 0) {
    return customer.vehiclesCount;
  }
  return customer.vehicles?.length ?? 0;
}

/** @deprecated Prefer `formatVehicleName` na coluna de listagem. */
export function formatPrimaryVehicle(vehicle?: CustomerVehicleDto | null): string {
  return formatVehicleName(vehicle);
}
