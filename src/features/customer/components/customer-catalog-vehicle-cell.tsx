"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

import { formatVehicleName, getCustomerVehiclesCount } from "../lib/format-customer-catalog";
import type { CustomerWithPrimaryVehicle } from "../types";

type CustomerCatalogVehicleCellProps = {
  customer: CustomerWithPrimaryVehicle;
  onShowAllVehicles: (customer: CustomerWithPrimaryVehicle) => void;
  className?: string;
};

export function CustomerCatalogVehicleCell({
  customer,
  onShowAllVehicles,
  className,
}: CustomerCatalogVehicleCellProps) {
  const vehiclesCount = getCustomerVehiclesCount(customer);
  const firstVehicle = customer.vehicles?.[0] ?? customer.primaryVehicle;
  const vehicleName = formatVehicleName(firstVehicle);

  if (vehiclesCount === 0) {
    return <span className={cn("text-muted-foreground", className)}>Sem veículo</span>;
  }

  if (vehiclesCount === 1) {
    return <span className={cn("text-foreground", className)}>{vehicleName}</span>;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-foreground">{vehicleName}</span>
      <button
        type="button"
        className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Ver ${vehiclesCount} veículos de ${customer.fullName}`}
        onClick={() => onShowAllVehicles(customer)}
      >
        <Badge variant="secondary" className="tabular-nums">
          {vehiclesCount}
        </Badge>
      </button>
    </div>
  );
}
