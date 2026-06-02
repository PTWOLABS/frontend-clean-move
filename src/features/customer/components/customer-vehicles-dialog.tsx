"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { listVehicles } from "@/features/vehicle/api/list-vehicles";
import { formatVehicleName } from "@/features/vehicle/lib/format-vehicle-catalog";
import type { VehicleDto } from "@/features/vehicle/types";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

type CustomerVehiclesDialogProps = {
  customerId: string | null;
  customerName: string;
  vehiclesCount?: number;
  embeddedVehicles?: VehicleDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function VehicleListItem({ vehicle }: { vehicle: VehicleDto }) {
  const name = formatVehicleName(vehicle);
  const details = [vehicle.plate, vehicle.color, vehicle.year != null ? String(vehicle.year) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="rounded-lg border border-border bg-muted/30 px-4 py-3">
      <p className="font-medium text-foreground">{name}</p>
      {details ? <p className="mt-0.5 text-sm text-muted-foreground">{details}</p> : null}
      {vehicle.notes ? <p className="mt-1 text-sm text-muted-foreground">{vehicle.notes}</p> : null}
    </li>
  );
}

export function CustomerVehiclesDialog({
  customerId,
  customerName,
  vehiclesCount,
  embeddedVehicles,
  open,
  onOpenChange,
}: CustomerVehiclesDialogProps) {
  const embeddedCount = embeddedVehicles?.length ?? 0;
  const knownCount = vehiclesCount ?? embeddedCount;
  const needsFetch = Boolean(customerId && knownCount > embeddedCount);
  const listFilters = {
    page: 1,
    size: Math.max(knownCount, embeddedCount, 1),
  };
  const vehiclesQueryKey = customerId
    ? QUERY_KEYS.vehicles(customerId, listFilters)
    : (["vehicles", "customer-dialog", "idle", listFilters] as const);

  const vehiclesQuery = useQuery({
    queryKey: vehiclesQueryKey,
    queryFn: ({ signal }) =>
      listVehicles(customerId!, { page: 1, size: Math.max(knownCount, 50) }, signal),
    enabled: open && needsFetch && Boolean(customerId),
  });

  const vehicles: VehicleDto[] = needsFetch
    ? (vehiclesQuery.data?.items ?? [])
    : (embeddedVehicles ?? []);
  const isLoading = needsFetch && vehiclesQuery.isLoading;
  const displayCount = vehiclesCount ?? vehicles.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-md">
        <DialogHeader className="shrink-0">
          <DialogTitle>Veículos do cliente</DialogTitle>
          <DialogDescription>
            {customerId ? (
              <>
                <span className="font-medium text-foreground">{customerName}</span>
                {" · "}
                {displayCount} {displayCount === 1 ? "veículo" : "veículos"}
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-2" aria-busy="true" aria-label="A carregar veículos">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
          ) : (
            <ul className="space-y-2">
              {vehicles.map((vehicle) => (
                <VehicleListItem key={vehicle.id} vehicle={vehicle} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
