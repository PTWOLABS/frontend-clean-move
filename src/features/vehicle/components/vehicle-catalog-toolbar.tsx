"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerDto } from "@/features/customer/types";

type VehicleCatalogToolbarProps = {
  customerSearch: string;
  onCustomerSearchChange: (value: string) => void;
  selectedCustomerId: string;
  onCustomerSelect: (customerId: string) => void;
  customers: CustomerDto[];
  isLoadingCustomers?: boolean;
};

export function VehicleCatalogToolbar({
  customerSearch,
  onCustomerSearchChange,
  selectedCustomerId,
  onCustomerSelect,
  customers,
  isLoadingCustomers = false,
}: VehicleCatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="relative flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Buscar cliente..."
          value={customerSearch}
          onChange={(event) => onCustomerSearchChange(event.target.value)}
          className="pl-9"
          aria-label="Buscar cliente"
        />
      </div>

      <div className="w-full sm:max-w-md">
        {isLoadingCustomers && customers.length === 0 ? (
          <Skeleton className="h-10 w-full rounded-md" aria-label="A carregar clientes" />
        ) : (
          <Select
            value={selectedCustomerId || undefined}
            onValueChange={onCustomerSelect}
            disabled={customers.length === 0}
          >
            <SelectTrigger className="w-full" aria-label="Selecionar cliente">
              <SelectValue
                placeholder={
                  customers.length === 0 ? "Nenhum cliente encontrado" : "Selecione um cliente"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.fullName}
                  {customer.phone ? ` · ${customer.phone}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
