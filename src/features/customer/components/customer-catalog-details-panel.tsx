import type { ReactNode } from "react";

import { User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

import {
  formatCpfCnpj,
  formatPhone,
  formatVehicleName,
  getCustomerVehiclesCount,
} from "../lib/format-customer-catalog";
import type { CustomerAddress, CustomerWithPrimaryVehicle } from "../types";

type CustomerCatalogDetailsPanelProps = {
  customer: CustomerWithPrimaryVehicle | null;
  className?: string;
};

function DetailSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function formatBirthDate(value?: string | null): string {
  if (!value?.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function formatAddress(address?: CustomerAddress | null): string {
  if (!address) return "—";

  const parts = [
    address.street?.trim(),
    address.complement?.trim(),
    [address.city?.trim(), address.state?.trim()].filter(Boolean).join(" - "),
    address.zipCode?.trim(),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "—";
}

export function CustomerCatalogDetailsPanel({
  customer,
  className,
}: CustomerCatalogDetailsPanelProps) {
  const primaryVehicle = customer?.vehicles?.[0] ?? customer?.primaryVehicle ?? null;
  const vehiclesCount = customer ? getCustomerVehiclesCount(customer) : 0;

  return (
    <aside
      className={cn("rounded-lg border border-border bg-card/80 p-4 sm:p-5", className)}
      aria-label="Detalhes do cliente"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Detalhes do cliente
      </p>

      {!customer ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Selecione um cliente na tabela para ver os detalhes.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          <div className="flex items-start gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted/80 text-muted-foreground"
              aria-hidden
            >
              <User className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <h3 className="text-lg font-semibold leading-tight text-foreground">
                {customer.fullName}
              </h3>
              {customer.nickname?.trim() ? (
                <p className="text-sm text-muted-foreground">Apelido: {customer.nickname}</p>
              ) : null}
            </div>
          </div>

          <DetailSection label="Contato">
            <div className="space-y-1 text-sm text-foreground">
              <p>{formatPhone(customer.phone)}</p>
              <p className="text-muted-foreground">{customer.email}</p>
            </div>
          </DetailSection>

          <DetailSection label="Documento">
            <p className="text-sm text-foreground">{formatCpfCnpj(customer.cpfCnpj)}</p>
            {customer.documentType ? (
              <Badge variant="secondary" className="mt-1 font-medium">
                {customer.documentType}
              </Badge>
            ) : null}
          </DetailSection>

          <DetailSection label="Data de nascimento">
            <p className="text-sm text-foreground">{formatBirthDate(customer.birthDate)}</p>
          </DetailSection>

          <DetailSection label="Endereço">
            <p className="text-sm text-foreground">{formatAddress(customer.address)}</p>
          </DetailSection>

          <DetailSection label="Veículo">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {formatVehicleName(primaryVehicle)}
              </p>
              {primaryVehicle?.plate?.trim() ? (
                <p className="text-sm text-muted-foreground">
                  Placa: {primaryVehicle.plate.trim()}
                </p>
              ) : null}
              <p className="text-sm text-muted-foreground">
                {vehiclesCount === 0
                  ? "Nenhum veículo cadastrado"
                  : `${vehiclesCount} veículo${vehiclesCount === 1 ? "" : "s"} cadastrado${vehiclesCount === 1 ? "" : "s"}`}
              </p>
            </div>
          </DetailSection>
        </div>
      )}
    </aside>
  );
}
