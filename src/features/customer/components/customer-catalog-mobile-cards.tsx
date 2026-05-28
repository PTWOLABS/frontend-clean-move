import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";

import { formatCpfCnpj, formatPhone } from "../lib/format-customer-catalog";
import type { CustomerWithPrimaryVehicle } from "../types";
import { CustomerCatalogVehicleCell } from "./customer-catalog-vehicle-cell";

type CustomerCatalogMobileCardsProps = {
  items: CustomerWithPrimaryVehicle[];
  onEdit: (item: CustomerWithPrimaryVehicle) => void;
  onDelete: (item: CustomerWithPrimaryVehicle) => void;
  onShowAllVehicles: (item: CustomerWithPrimaryVehicle) => void;
};

export function CustomerCatalogMobileCards({
  items,
  onEdit,
  onDelete,
  onShowAllVehicles,
}: CustomerCatalogMobileCardsProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">{item.fullName}</h3>
              <p className="text-sm text-muted-foreground">{formatPhone(item.phone)}</p>
              <p className="text-sm text-muted-foreground">{item.email}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Documento</p>
              <p className="text-sm text-foreground">{formatCpfCnpj(item.cpfCnpj)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Veículo</p>
              <CustomerCatalogVehicleCell customer={item} onShowAllVehicles={onShowAllVehicles} />
            </div>

            <Separator />

            <HintTooltipProvider>
              <div className="flex gap-2">
                <HintTooltip label="Editar">
                  <Button type="button" variant="outline" size="icon" onClick={() => onEdit(item)}>
                    <Pencil className="size-4" />
                  </Button>
                </HintTooltip>
                <HintTooltip label="Apagar">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </HintTooltip>
              </div>
            </HintTooltipProvider>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
