import { Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ServiceCatalogHeaderProps = {
  totalCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function ServiceCatalogHeader({
  totalCount,
  isRefreshing,
  onRefresh,
}: ServiceCatalogHeaderProps) {
  const countLabel =
    totalCount === 1 ? "1 serviço cadastrado" : `${totalCount} serviços cadastrados`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Catálogo de serviços
        </h1>
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RotateCcw className={isRefreshing ? "animate-spin" : ""} aria-hidden />
          Restaurar
        </Button>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button type="button" size="sm" className="gap-2" disabled>
                  <Plus aria-hidden />
                  Adicionar serviço
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Em breve</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
