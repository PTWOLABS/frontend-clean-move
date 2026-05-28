import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type CustomerCatalogHeaderProps = {
  totalCount: number;
  onAddCustomer: () => void;
};

export function CustomerCatalogHeader({ totalCount, onAddCustomer }: CustomerCatalogHeaderProps) {
  const countLabel =
    totalCount === 1 ? "1 cliente cadastrado" : `${totalCount} clientes cadastrados`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clientes</h1>
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      </div>
      <Button type="button" size="sm" className="gap-2" onClick={onAddCustomer}>
        <Plus aria-hidden />
        Adicionar cliente
      </Button>
    </div>
  );
}
