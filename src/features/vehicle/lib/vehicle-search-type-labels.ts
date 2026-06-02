import type { VehicleSearchType } from "../types";

export const VEHICLE_SEARCH_TYPE_OPTIONS: { value: VehicleSearchType; label: string }[] = [
  { value: "plate", label: "Placa" },
  { value: "name", label: "Cliente" },
  { value: "model", label: "Modelo" },
  { value: "brand", label: "Marca" },
  { value: "color", label: "Cor" },
  { value: "year", label: "Ano" },
];

const SEARCH_PLACEHOLDERS: Record<VehicleSearchType, string> = {
  plate: "Ex.: ABC-1D23",
  name: "Ex.: Maria Silva",
  model: "Ex.: Gol",
  brand: "Ex.: Volkswagen",
  color: "Ex.: Branco",
  year: "Ex.: 2020",
};

export function getVehicleSearchPlaceholder(type: VehicleSearchType): string {
  return SEARCH_PLACEHOLDERS[type];
}
