import { Car, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils/cn";

import {
  formatVehicleName,
  formatVehiclePlate,
  formatVehicleYear,
  getVehicleColorSwatchClass,
} from "../lib/format-vehicle-catalog";
import type { VehicleDto } from "../types";

type CardActionsProps = {
  item: VehicleDto;
  onEdit: (item: VehicleDto) => void;
  onDelete: (item: VehicleDto) => void;
};

function CardActions({ item, onEdit, onDelete }: CardActionsProps) {
  const canMutate = Boolean(item.id);

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 flex-1 gap-2 border-primary/40 bg-background/50 text-foreground hover:bg-primary/10 hover:text-foreground"
        disabled={!canMutate}
        aria-label="Editar veículo"
        onClick={() => onEdit(item)}
      >
        <Pencil className="size-4 shrink-0 text-primary" aria-hidden />
        Editar
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 flex-1 gap-2 border-destructive/40 bg-background/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={!canMutate}
        aria-label="Excluir veículo"
        onClick={() => onDelete(item)}
      >
        <Trash2 className="size-4 shrink-0" aria-hidden />
        Excluir
      </Button>
    </div>
  );
}

type VehicleCatalogMobileCardsProps = {
  items: VehicleDto[];
  onEdit: (item: VehicleDto) => void;
  onDelete: (item: VehicleDto) => void;
};

function formatBrandLabel(item: VehicleDto): string {
  return item.brand?.trim().toUpperCase() || "—";
}

function formatModelLabel(item: VehicleDto): string {
  const model = item.model?.trim();
  if (model) return model;

  const name = formatVehicleName(item);
  const plate = formatVehiclePlate(item);
  if (name !== "—" && name !== plate) return name;

  return "—";
}

function formatColorLabel(item: VehicleDto): string {
  return item.color?.trim() || "—";
}

export function VehicleCatalogMobileCards({
  items,
  onEdit,
  onDelete,
}: VehicleCatalogMobileCardsProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((item) => {
        const colorLabel = formatColorLabel(item);

        return (
          <Card
            key={item.id}
            className="overflow-hidden border-primary/25 bg-card shadow-sm ring-1 ring-primary/10"
          >
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full border-success/35 bg-success/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success"
                >
                  {formatBrandLabel(item)}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/35 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-primary"
                >
                  {formatVehicleYear(item)}
                </Badge>
              </div>

              <div className="min-w-0 space-y-1">
                <h3 className="truncate text-2xl font-bold uppercase tracking-wide text-foreground">
                  {formatVehiclePlate(item)}
                </h3>
                <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  <Car className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{formatModelLabel(item)}</span>
                </div>
              </div>

              <Separator className="bg-border/60" />

              <div className="flex min-w-0 items-center gap-2 text-sm">
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full ring-1 ring-border/80",
                    getVehicleColorSwatchClass(item.color),
                  )}
                  aria-hidden
                />
                <p className="truncate text-muted-foreground">
                  Cor:{" "}
                  <span className="font-semibold text-foreground">{colorLabel}</span>
                </p>
              </div>

              {item.notes?.trim() ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.notes.trim()}</p>
              ) : null}

              <CardActions item={item} onEdit={onEdit} onDelete={onDelete} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
