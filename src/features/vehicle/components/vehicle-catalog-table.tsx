import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowIconActions } from "@/shared/components/row-icon-actions";

import {
  formatVehicleName,
  formatVehiclePlate,
  formatVehicleYear,
} from "../lib/format-vehicle-catalog";
import type { VehicleDto } from "../types";

type VehicleCatalogTableProps = {
  items: VehicleDto[];
  getCustomerLabel: (customerId: string) => string | undefined;
  onAddVehicle: (item: VehicleDto) => void;
  onEdit: (item: VehicleDto) => void;
  onDelete: (item: VehicleDto) => void;
};

export function VehicleCatalogTable({
  items,
  getCustomerLabel,
  onAddVehicle,
  onEdit,
  onDelete,
}: VehicleCatalogTableProps) {
  return (
    <div className="hidden rounded-lg border border-border md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 text-xs font-medium uppercase tracking-wide text-foreground">
              Placa
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Cliente
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Marca
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Modelo
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Cor
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Ano
            </TableHead>
            <TableHead className="pr-4 text-right text-xs font-medium uppercase tracking-wide text-foreground">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="pl-4 font-medium text-foreground">
                {formatVehiclePlate(item)}
              </TableCell>
              <TableCell>{getCustomerLabel(item.customerId)?.trim() || "—"}</TableCell>
              <TableCell>{item.brand?.trim() || "—"}</TableCell>
              <TableCell>{item.model?.trim() || formatVehicleName(item)}</TableCell>
              <TableCell>{item.color?.trim() || "—"}</TableCell>
              <TableCell>{formatVehicleYear(item)}</TableCell>
              <TableCell className="pr-4 text-right">
                <RowIconActions
                  className="justify-end"
                  actions={[
                    {
                      label: "Adicionar veículo",
                      icon: Plus,
                      onClick: () => onAddVehicle(item),
                      className: "text-primary hover:bg-primary/10 hover:text-primary",
                    },
                    {
                      label: "Editar",
                      icon: Pencil,
                      onClick: () => onEdit(item),
                      className: "text-foreground hover:bg-accent hover:text-foreground",
                    },
                    {
                      label: "Apagar",
                      icon: Trash2,
                      onClick: () => onDelete(item),
                      className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
