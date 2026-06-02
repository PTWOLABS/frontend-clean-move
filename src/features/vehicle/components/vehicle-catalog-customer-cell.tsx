"use client";

import { CatalogVehicleCountTrigger } from "@/shared/components/catalog-vehicle-count-trigger";
import { cn } from "@/shared/utils/cn";

type VehicleCatalogCustomerCellProps = {
  customerId: string;
  customerName: string;
  vehiclesCount?: number;
  isCountLoading?: boolean;
  onShowAllVehicles: (payload: {
    customerId: string;
    customerName: string;
    vehiclesCount: number;
  }) => void;
  className?: string;
};

export function VehicleCatalogCustomerCell({
  customerId,
  customerName,
  vehiclesCount,
  isCountLoading,
  onShowAllVehicles,
  className,
}: VehicleCatalogCustomerCellProps) {
  const displayName = customerName.trim() || "—";
  const showModalTrigger = !isCountLoading && vehiclesCount != null && vehiclesCount > 1;

  if (showModalTrigger) {
    return (
      <CatalogVehicleCountTrigger
        label={displayName}
        count={vehiclesCount}
        ariaLabel={`Ver ${vehiclesCount} veículos de ${displayName}`}
        onClick={() =>
          onShowAllVehicles({
            customerId,
            customerName: displayName,
            vehiclesCount,
          })
        }
        className={className}
      />
    );
  }

  return <span className={cn("truncate text-foreground", className)}>{displayName}</span>;
}
