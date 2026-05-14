import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/utils/cn";

export type ServiceActiveFilter = "all" | "active" | "inactive";

type ServiceCatalogToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: ServiceActiveFilter;
  onActiveFilterChange: (value: ServiceActiveFilter) => void;
};

const filterButtons: { value: ServiceActiveFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

export function ServiceCatalogToolbar({
  search,
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
}: ServiceCatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Buscar serviço..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Buscar serviço por nome"
        />
      </div>
      <div
        className="flex w-full rounded-lg bg-muted p-1 lg:w-auto"
        role="group"
        aria-label="Filtrar por estado do serviço"
      >
        {filterButtons.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={activeFilter === value ? "default" : "ghost"}
            className={cn(
              "flex-1 rounded-md shadow-none lg:flex-none",
              activeFilter === value ? "" : "text-muted-foreground",
            )}
            onClick={() => onActiveFilterChange(value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
