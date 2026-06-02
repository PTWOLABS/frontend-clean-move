"use client";

import { Badge } from "@/components/ui/badge";
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

  if (!showModalTrigger) {
    return <span className={cn("text-foreground", className)}>{displayName}</span>;
  }

  return (
    <button
      type="button"
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-left text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      aria-label={`Ver ${vehiclesCount} veículos de ${displayName}`}
      onClick={() =>
        onShowAllVehicles({
          customerId,
          customerName: displayName,
          vehiclesCount,
        })
      }
    >
      <span className="truncate">{displayName}</span>
      <Badge variant="secondary" className="shrink-0 tabular-nums">
        {vehiclesCount}
      </Badge>
    </button>
  );
}
