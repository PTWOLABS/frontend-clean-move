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

  return (
    <button
      type="button"
      className={cn(
        "flex w-full flex-wrap items-center gap-2 rounded-md px-1 py-0.5 text-left text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
        className,
      )}
      aria-label={`Ver ${vehiclesCount} veículos de ${customer.fullName}`}
      onClick={() => onShowAllVehicles(customer)}
    >
      <span className="inline-flex text-foreground">
        {vehicleName}
      </span>
      {vehiclesCount > 1 ? (
        <Badge variant="secondary" className="tabular-nums">
          {vehiclesCount}
        </Badge>
      ) : null}
    </button>
  );
}
