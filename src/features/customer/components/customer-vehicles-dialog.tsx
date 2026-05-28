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

import { getCustomerVehiclesCount } from "../lib/format-customer-catalog";
import type { CustomerVehicleDto, CustomerWithPrimaryVehicle } from "../types";

type CustomerVehiclesDialogProps = {
  customer: CustomerWithPrimaryVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function VehicleListItem({ vehicle }: { vehicle: CustomerVehicleDto }) {
  const name = formatVehicleName(vehicle);
  const details = [vehicle.plate, vehicle.color, vehicle.year != null ? String(vehicle.year) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="rounded-lg border border-border bg-muted/30 px-4 py-3">
      <p className="font-medium text-foreground">{name}</p>
      {details ? <p className="mt-0.5 text-sm text-muted-foreground">{details}</p> : null}
      {vehicle.notes ? (
        <p className="mt-1 text-sm text-muted-foreground">{vehicle.notes}</p>
      ) : null}
    </li>
  );
}

export function CustomerVehiclesDialog({ customer, open, onOpenChange }: CustomerVehiclesDialogProps) {
  const vehiclesCount = customer ? getCustomerVehiclesCount(customer) : 0;
  const embeddedCount = customer?.vehicles?.length ?? 0;
  const needsFetch = Boolean(customer && vehiclesCount > embeddedCount);

  const vehiclesQuery = useQuery({
    queryKey: QUERY_KEYS.vehicles(customer?.id ?? "", {
      page: 1,
      size: Math.max(vehiclesCount, embeddedCount, 1),
    }),
    queryFn: ({ signal }) =>
      listVehicles(
        customer!.id,
        { page: 1, size: Math.max(vehiclesCount, 50) },
        signal,
      ),
    enabled: open && needsFetch && Boolean(customer?.id),
  });

  const vehicles: VehicleDto[] = needsFetch
    ? (vehiclesQuery.data?.items ?? [])
    : (customer?.vehicles ?? []);
  const isLoading = needsFetch && vehiclesQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-md">
        <DialogHeader className="shrink-0">
          <DialogTitle>Veículos do cliente</DialogTitle>
          <DialogDescription>
            {customer ? (
              <>
                <span className="font-medium text-foreground">{customer.fullName}</span>
                {" · "}
                {vehiclesCount} {vehiclesCount === 1 ? "veículo" : "veículos"}
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
