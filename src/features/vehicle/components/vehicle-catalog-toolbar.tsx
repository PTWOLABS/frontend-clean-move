"use client";

import { Combobox, type ComboboxItemOption } from "@/components/ui/combobox/combobox";

type VehicleCatalogToolbarProps = {
  customerLabel: string;
  onCustomerLabelChange: (value: string) => void;
  onCustomerSearchChange: (value: string) => void;
  onCustomerSelect: (option: ComboboxItemOption | null) => void;
  customerOptions: ComboboxItemOption[];
  customerEmptyMessage: string;
};

export function VehicleCatalogToolbar({
  customerLabel,
  onCustomerLabelChange,
  onCustomerSearchChange,
  onCustomerSelect,
  customerOptions,
  customerEmptyMessage,
}: VehicleCatalogToolbarProps) {
  return (
    <div className="w-full sm:max-w-md">
      <Combobox
        value={customerLabel}
        onValueChange={onCustomerLabelChange}
        onDebouncedValueChange={onCustomerSearchChange}
        onSelectedItemChange={onCustomerSelect}
        items={customerOptions}
        placeholder="Digite o nome do cliente"
        emptyMessage={customerEmptyMessage}
        autoComplete="name"
        aria-label="Selecionar cliente"
        className="w-full"
      />
    </div>
  );
}
