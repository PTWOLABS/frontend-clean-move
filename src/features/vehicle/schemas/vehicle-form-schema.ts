import { z } from "zod";

import type { CreateVehiclePayload, VehicleDto } from "../types";

export const vehicleFieldsSchema = z.object({
  id: z.string().optional(),
  plate: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  year: z.union([z.string(), z.number()]).optional(),
  notes: z.string().optional(),
});

export const vehicleFormSchema = vehicleFieldsSchema.superRefine((data, ctx) => {
  const plate = normalizePlate(data.plate);
  if (plate && plate.length !== 7) {
    ctx.addIssue({
      code: "custom",
      path: ["plate"],
      message: "Placa inválida. Informe 7 caracteres.",
    });
  }

  const year = parseVehicleYear(data.year);
  if (year !== undefined && (!Number.isInteger(year) || year < 1900)) {
    ctx.addIssue({
      code: "custom",
      path: ["year"],
      message: "Ano do veículo inválido (mínimo 1900).",
    });
  }
});

export type VehicleFormInput = z.input<typeof vehicleFormSchema>;
export type VehicleFormValues = z.output<typeof vehicleFormSchema>;

export const vehicleFormDefaultValues: VehicleFormInput = {
  id: undefined,
  plate: "",
  brand: "",
  model: "",
  color: "",
  year: undefined,
  notes: "",
};

export const emptyVehicleFormValues = vehicleFormDefaultValues;

export function normalizePlate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return normalized || undefined;
}

export function parseVehicleYear(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function hasVehicleData(vehicle?: VehicleDto | null): boolean {
  if (!vehicle) return false;
  return Boolean(
    vehicle.plate?.trim() ||
      vehicle.brand?.trim() ||
      vehicle.model?.trim() ||
      vehicle.color?.trim() ||
      vehicle.year != null ||
      vehicle.notes?.trim(),
  );
}

export function vehicleToFormDefaults(vehicle: VehicleDto): VehicleFormInput {
  return {
    id: vehicle.id,
    plate: vehicle.plate ?? "",
    brand: vehicle.brand ?? "",
    model: vehicle.model ?? "",
    color: vehicle.color ?? "",
    year: vehicle.year ?? undefined,
    notes: vehicle.notes ?? "",
  };
}

export function mapVehicleFormToPayload(values: VehicleFormValues): CreateVehiclePayload | null {
  const plate = normalizePlate(values.plate);
  const brand = values.brand?.trim() || undefined;
  const model = values.model?.trim() || undefined;
  const color = values.color?.trim() || undefined;
  const year = parseVehicleYear(values.year);
  const notes = values.notes?.trim() || undefined;

  const payload: CreateVehiclePayload = {
    plate,
    brand,
    model,
    color,
    year: year !== undefined && Number.isInteger(year) ? year : undefined,
    notes,
  };

  const hasAnyValue = Object.values(payload).some(
    (value) => value !== undefined && value !== null && value !== "",
  );

  return hasAnyValue ? payload : null;
}
