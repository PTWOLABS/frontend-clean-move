import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type VehicleCatalogHeaderProps = {
  totalCount: number;
  hasCustomerSelected: boolean;
  onAddVehicle: () => void;
};

export function VehicleCatalogHeader({
  totalCount,
  hasCustomerSelected,
  onAddVehicle,
}: VehicleCatalogHeaderProps) {
  const countLabel = !hasCustomerSelected
    ? "Selecione um cliente para ver os veículos"
    : totalCount === 1
      ? "1 veículo cadastrado"
      : `${totalCount} veículos cadastrados`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Veículos</h1>
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      </div>
      <Button
        type="button"
        size="sm"
        className="gap-2"
        disabled={!hasCustomerSelected}
        onClick={onAddVehicle}
      >
        <Plus aria-hidden />
        Adicionar veículo
      </Button>
    </div>
  );
}
