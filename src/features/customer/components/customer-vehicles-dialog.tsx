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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const COLOR_DOT_CLASSES: Record<string, string> = {
  preto: "bg-neutral-900 ring-white/20",
  branca: "bg-neutral-100 ring-border",
  branco: "bg-neutral-100 ring-border",
  cinza: "bg-slate-400 ring-white/20",
  prata: "bg-slate-300 ring-white/20",
  azul: "bg-blue-500 ring-blue-300/40",
  vermelho: "bg-red-500 ring-red-300/40",
  verde: "bg-emerald-500 ring-emerald-300/40",
  amarelo: "bg-yellow-400 ring-yellow-200/40",
};

function normalizeColorKey(color: string) {
  return color
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function VehicleColorCell({ color }: { color?: string | null }) {
  const sanitizedColor = color?.trim();
  if (!sanitizedColor) {
    return <span className="text-muted-foreground">—</span>;
  }

  const colorClass =
    COLOR_DOT_CLASSES[normalizeColorKey(sanitizedColor)] ?? "bg-slate-500 ring-white/20";

  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className={`h-3.5 w-3.5 rounded-full ring-1 ${colorClass}`} />
      <span>{sanitizedColor}</span>
    </span>
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
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden px-4 pb-4 pt-5 sm:max-w-4xl sm:px-6 sm:pb-6">
        <DialogHeader className="shrink-0 space-y-0.5">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
            Veículos do cliente
          </DialogTitle>
          <DialogDescription>
            {customerId ? (
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{customerName}</span>
                {" · "}
                {displayCount} {displayCount === 1 ? "veículo" : "veículos"}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div
              className="overflow-x-auto rounded-xl border border-border/80"
              aria-busy="true"
              aria-label="A carregar veículos"
            >
              <div className="min-w-160">
                <div className="grid grid-cols-[2fr_1.2fr_1.2fr_0.8fr] border-b border-border/70 bg-muted/20 px-5 py-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div className="space-y-0">
                  <div className="grid grid-cols-[2fr_1.2fr_1.2fr_0.8fr] border-b border-border/70 px-5 py-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <div className="grid grid-cols-[2fr_1.2fr_1.2fr_0.8fr] px-5 py-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </div>
            </div>
          ) : vehicles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Nenhum veículo cadastrado.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/80 bg-card/40">
              <Table className="min-w-160 text-sm">
                <TableHeader>
                  <TableRow className="border-border/80 bg-muted/20 hover:bg-muted/20">
                    <TableHead className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Veículo
                    </TableHead>
                    <TableHead className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Placa
                    </TableHead>
                    <TableHead className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Cor
                    </TableHead>
                    <TableHead className="h-11 px-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Ano
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} className="border-border/70">
                      <TableCell className="px-5 py-3.5 text-foreground">
                        {formatVehicleName(vehicle)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-foreground">
                        {vehicle.plate?.trim() || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-foreground">
                        <VehicleColorCell color={vehicle.color} />
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-foreground">
                        {vehicle.year != null ? String(vehicle.year) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
