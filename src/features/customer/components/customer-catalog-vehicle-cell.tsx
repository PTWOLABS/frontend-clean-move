"use client";

import { Badge } from "@/components/ui/badge";
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

  return (
    <button
      type="button"
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isEndAligned
          ? "ml-auto w-auto max-w-full flex-nowrap justify-end text-right"
          : "w-full flex-wrap text-left",
        className,
      )}
      aria-label={`Ver ${vehiclesCount} veículos de ${customer.fullName}`}
      onClick={() => onShowAllVehicles(customer)}
    >
      <span
        className={cn(
          "text-foreground",
          isEndAligned ? "truncate text-sm" : "inline-flex",
        )}
      >
        {vehicleName}
      </span>
      {vehiclesCount > 1 ? (
        <Badge variant="secondary" className="shrink-0 tabular-nums">
          {vehiclesCount}
        </Badge>
      ) : null}
    </button>
  );
}
