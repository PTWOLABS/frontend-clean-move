"use client";

import { CatalogVehicleCountTrigger } from "@/shared/components/catalog-vehicle-count-trigger";
import { cn } from "@/shared/utils/cn";

import { formatVehicleName, getCustomerVehiclesCount } from "../lib/format-customer-catalog";
import type { CustomerWithPrimaryVehicle } from "../types";

type CustomerCatalogVehicleCellProps = {
  customer: CustomerWithPrimaryVehicle;
  onShowAllVehicles: (customer: CustomerWithPrimaryVehicle) => void;
  className?: string;
  align?: "start" | "end";
};

export function CustomerCatalogVehicleCell({
  customer,
  onShowAllVehicles,
  className,
  align = "start",
}: CustomerCatalogVehicleCellProps) {
  const vehiclesCount = getCustomerVehiclesCount(customer);
  const firstVehicle = customer.vehicles?.[0] ?? customer.primaryVehicle;
  const vehicleName = formatVehicleName(firstVehicle);
  const isEndAligned = align === "end";

  if (vehiclesCount === 0) {
    return (
      <span
        className={cn(
          "text-muted-foreground",
          isEndAligned && "ml-auto block max-w-full truncate text-right text-sm",
          className,
        )}
      >
        Sem veículo
      </span>
    );
  }

  if (vehiclesCount > 1) {
    return (
      <CatalogVehicleCountTrigger
        label={vehicleName}
        count={vehiclesCount}
        align={align}
        ariaLabel={`Ver ${vehiclesCount} veículos de ${customer.fullName}`}
        onClick={() => onShowAllVehicles(customer)}
        className={cn(isEndAligned && "w-full max-w-full", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "text-sm text-foreground",
        isEndAligned && "ml-auto block max-w-full truncate text-right",
        className,
      )}
    >
      {vehicleName}
    </span>
  );
}
