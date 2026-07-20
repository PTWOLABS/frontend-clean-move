import { FolderTree, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type ServiceCatalogHeaderProps = {
  totalCount: number;
  onAddService: () => void;
  onManageCategories: () => void;
};

export function ServiceCatalogHeader({
  totalCount,
  onAddService,
  onManageCategories,
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
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full gap-2 sm:w-auto"
          onClick={onManageCategories}
        >
          <FolderTree aria-hidden />
          Gerir categorias
        </Button>
        <Button type="button" className="h-10 w-full gap-2 sm:w-auto" onClick={onAddService}>
          <Plus aria-hidden />
          Adicionar serviço
        </Button>
      </div>
    </div>
  );
}
