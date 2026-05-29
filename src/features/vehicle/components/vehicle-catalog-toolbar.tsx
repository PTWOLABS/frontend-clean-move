import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type VehicleCatalogToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function VehicleCatalogToolbar({ search, onSearchChange }: VehicleCatalogToolbarProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Buscar por nome do cliente..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
        aria-label="Buscar veículos por nome do cliente"
      />
    </div>
  );
}
