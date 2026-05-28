import { Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowIconActions } from "@/shared/components/row-icon-actions";

import { formatCpfCnpj, formatPhone } from "../lib/format-customer-catalog";
import type { CustomerWithPrimaryVehicle } from "../types";
import { CustomerCatalogVehicleCell } from "./customer-catalog-vehicle-cell";

type CustomerCatalogTableProps = {
  items: CustomerWithPrimaryVehicle[];
  onEdit: (item: CustomerWithPrimaryVehicle) => void;
  onDelete: (item: CustomerWithPrimaryVehicle) => void;
  onShowAllVehicles: (item: CustomerWithPrimaryVehicle) => void;
};

export function CustomerCatalogTable({
  items,
  onEdit,
  onDelete,
  onShowAllVehicles,
}: CustomerCatalogTableProps) {
  return (
    <div className="hidden rounded-lg border border-border md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 text-xs font-medium uppercase tracking-wide text-foreground">
              Cliente
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Contato
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Documento
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Veículo
            </TableHead>
            <TableHead className="pr-4 text-right text-xs font-medium uppercase tracking-wide text-foreground">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="pl-4">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">{item.fullName}</p>
                  {item.nickname ? (
                    <p className="text-sm text-muted-foreground">Apelido: {item.nickname}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="text-foreground">{formatPhone(item.phone)}</p>
                  <p className="text-sm text-muted-foreground">{item.email}</p>
                </div>
              </TableCell>
              <TableCell>{formatCpfCnpj(item.cpfCnpj)}</TableCell>
              <TableCell>
                <CustomerCatalogVehicleCell
                  customer={item}
                  onShowAllVehicles={onShowAllVehicles}
                />
              </TableCell>
              <TableCell className="pr-4 text-right">
                <RowIconActions
                  className="justify-end"
                  actions={[
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
