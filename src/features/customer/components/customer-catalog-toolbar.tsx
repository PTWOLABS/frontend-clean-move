import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type CustomerCatalogToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function CustomerCatalogToolbar({ search, onSearchChange }: CustomerCatalogToolbarProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Buscar cliente..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
        aria-label="Buscar cliente por nome, telefone, e-mail ou documento"
      />
    </div>
  );
}
