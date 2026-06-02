import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
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
      className={cn(
        "flex h-full min-w-0 flex-col rounded-lg border border-border bg-card/80 p-4 sm:p-5",
        className,
      )}
      aria-label="Detalhes do serviço"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Detalhes do serviço
      </p>

      {!service ? (
        <div className="mt-4 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <p className="text-sm text-muted-foreground">
            Selecione um serviço na tabela para ver os detalhes.
          </p>
        </div>
      ) : (
        <HintTooltipProvider>
          <div className="mt-4 min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto pr-1">
            <div className="flex min-w-0 items-start gap-3">
              <ServiceCatalogItemThumb className="size-11" />
              <HintTooltip label={service.serviceName}>
                <h3 className="min-w-0 max-w-full truncate pt-1 text-lg font-semibold leading-tight text-foreground">
                  {service.serviceName}
                </h3>
              </HintTooltip>
            </div>

            <DetailSection label="Descrição">
              {service.description?.trim() ? (
                <HintTooltip label={service.description}>
                  <p className="line-clamp-3 min-w-0 max-w-full text-sm text-foreground">
                    {service.description}
                  </p>
                </HintTooltip>
              ) : (
                <p className="text-sm text-foreground">—</p>
              )}
            </DetailSection>

            <DetailSection label="Categoria">
              <Badge variant="secondary" className="max-w-full truncate font-medium">
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
        </HintTooltipProvider>
      )}
    </aside>
  );
}
