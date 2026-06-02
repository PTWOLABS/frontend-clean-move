import { Search } from "lucide-react";

import { Select } from "@/components/ui/select/select";
import { Input } from "@/components/ui/input";

import {
  getVehicleSearchPlaceholder,
  VEHICLE_SEARCH_TYPE_OPTIONS,
} from "../lib/vehicle-search-type-labels";
import type { VehicleSearchType } from "../types";

type VehicleCatalogToolbarProps = {
  search: string;
  searchType: VehicleSearchType;
  onSearchChange: (value: string) => void;
  onSearchTypeChange: (value: VehicleSearchType) => void;
};

export function VehicleCatalogToolbar({
  search,
  searchType,
  onSearchChange,
  onSearchTypeChange,
}: VehicleCatalogToolbarProps) {
  const placeholder = getVehicleSearchPlaceholder(searchType);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-full sm:w-40">
        <span className="sr-only">Campo de busca</span>
        <Select
          value={searchType}
          onChange={onSearchTypeChange}
          options={VEHICLE_SEARCH_TYPE_OPTIONS}
          className="w-full"
        />
      </div>
      <div className="relative w-full max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label={`Buscar veículos por ${VEHICLE_SEARCH_TYPE_OPTIONS.find((o) => o.value === searchType)?.label?.toLowerCase() ?? "campo selecionado"}`}
        />
      </div>
    </div>
  );
}
