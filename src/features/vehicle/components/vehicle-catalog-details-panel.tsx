import type { ReactNode } from "react";

import { Car } from "lucide-react";

import { cn } from "@/shared/utils/cn";

import {
  formatVehicleName,
  formatVehiclePlate,
  formatVehicleYear,
  getVehicleColorSwatchClass,
} from "../lib/format-vehicle-catalog";
import type { VehicleDto } from "../types";
import { VehicleCatalogCustomerCell } from "./vehicle-catalog-customer-cell";

type VehicleCatalogDetailsPanelProps = {
  vehicle: VehicleDto | null;
  customerLabel?: string;
  vehiclesCount?: number;
  isCustomerVehicleCountsLoading?: boolean;
  onShowAllVehicles?: (payload: {
    customerId: string;
    customerName: string;
    vehiclesCount: number;
  }) => void;
  className?: string;
};

function DetailSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function VehicleCatalogDetailsPanel({
  vehicle,
  customerLabel,
  vehiclesCount,
  isCustomerVehicleCountsLoading,
  onShowAllVehicles,
  className,
}: VehicleCatalogDetailsPanelProps) {
  const color = vehicle?.color?.trim();
  const displayCustomerName = customerLabel?.trim() || "—";

  return (
    <aside
      className={cn("rounded-lg border border-border bg-card/80 p-4 sm:p-5", className)}
      aria-label="Detalhes do veículo"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Detalhes do veículo
      </p>

      {!vehicle ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Selecione um veículo na tabela para ver os detalhes.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          <div className="flex items-start gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted/80 text-muted-foreground"
              aria-hidden
            >
              <Car className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <h3 className="text-lg font-semibold leading-tight text-foreground">
                {formatVehiclePlate(vehicle)}
              </h3>
              <p className="text-sm text-muted-foreground">{formatVehicleName(vehicle)}</p>
            </div>
          </div>

          <DetailSection label="Cliente">
            {vehicle && onShowAllVehicles ? (
              <VehicleCatalogCustomerCell
                customerId={vehicle.customerId}
                customerName={displayCustomerName}
                vehiclesCount={vehiclesCount}
                isCountLoading={isCustomerVehicleCountsLoading}
                onShowAllVehicles={onShowAllVehicles}
              />
            ) : (
              <p className="text-sm text-foreground">{displayCustomerName}</p>
            )}
          </DetailSection>

          <DetailSection label="Marca">
            <p className="text-sm text-foreground">{vehicle.brand?.trim() || "—"}</p>
          </DetailSection>

          <DetailSection label="Modelo">
            <p className="text-sm text-foreground">{vehicle.model?.trim() || "—"}</p>
          </DetailSection>

          <DetailSection label="Cor">
            <div className="flex items-center gap-2">
              {color ? (
                <span
                  className={cn("size-3 shrink-0 rounded-full", getVehicleColorSwatchClass(color))}
                  aria-hidden
                />
              ) : null}
              <p className="text-sm text-foreground">{color || "—"}</p>
            </div>
          </DetailSection>

          <DetailSection label="Ano">
            <p className="text-2xl font-semibold tabular-nums text-primary">
              {formatVehicleYear(vehicle)}
            </p>
          </DetailSection>

          <DetailSection label="Observações">
            <p className="text-sm text-foreground">{vehicle.notes?.trim() || "—"}</p>
          </DetailSection>
        </div>
      )}
    </aside>
  );
}
