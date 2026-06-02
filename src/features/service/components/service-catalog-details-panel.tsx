import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

import { formatServiceCategory, formatServicePriceBrl } from "../lib/format-catalog";
import type { ServiceItem } from "../types";

import { ServiceCatalogItemThumb } from "./service-catalog-item-thumb";
import { ServiceStatusBadge } from "./service-status-badge";

type ServiceCatalogDetailsPanelProps = {
  service: ServiceItem | null;
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

function formatMinutesLabel(minutes: number): string {
  return `${minutes} min`;
}

export function ServiceCatalogDetailsPanel({
  service,
  className,
}: ServiceCatalogDetailsPanelProps) {
  const minMinutes = service?.estimatedDuration?.minInMinutes ?? 0;
  const maxMinutes = service?.estimatedDuration?.maxInMinutes ?? minMinutes;

  return (
    <aside
      className={cn("rounded-lg border border-border bg-card/80 p-4 sm:p-5", className)}
      aria-label="Detalhes do serviço"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Detalhes do serviço
      </p>

      {!service ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Selecione um serviço na tabela para ver os detalhes.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          <div className="flex items-start gap-3">
            <ServiceCatalogItemThumb className="size-11" />
            <h3 className="pt-1 text-lg font-semibold leading-tight text-foreground">
              {service.serviceName}
            </h3>
          </div>

          <DetailSection label="Descrição">
            <p className="text-sm text-foreground">{service.description?.trim() || "—"}</p>
          </DetailSection>

          <DetailSection label="Categoria">
            <Badge variant="secondary" className="font-medium">
              {formatServiceCategory(service.category)}
            </Badge>
          </DetailSection>

          <DetailSection label="Duração">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Mínima</p>
                <p className="text-sm font-medium text-foreground">
                  {formatMinutesLabel(minMinutes)}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Máxima</p>
                <p className="text-sm font-medium text-foreground">
                  {formatMinutesLabel(maxMinutes)}
                </p>
              </div>
            </div>
          </DetailSection>

          <DetailSection label="Preço">
            <p className="text-2xl font-semibold tabular-nums text-primary">
              {formatServicePriceBrl(service.price)}
            </p>
          </DetailSection>

          <DetailSection label="Status">
            <ServiceStatusBadge isActive={service.isActive} />
          </DetailSection>
        </div>
      )}
    </aside>
  );
}
