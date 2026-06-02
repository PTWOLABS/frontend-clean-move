"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  type Control,
  type FieldValues,
  type Resolver,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxItemOption } from "@/components/ui/combobox/combobox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form/field";
import { InputField } from "@/components/ui/form/input-field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useListCustomerOptions } from "@/features/appointments/hooks/queries/use-list-customer-options";

import { useCreateVehicle } from "../hooks/use-create-vehicle";
import { useUpdateVehicle } from "../hooks/use-update-vehicle";
import {
  vehicleFormDefaultValues,
  vehicleFormSchema,
  vehicleToFormDefaults,
  type VehicleFormInput,
  type VehicleFormValues,
} from "../schemas/vehicle-form-schema";
import type { VehicleDto } from "../types";

const CUSTOMER_OPTIONS_LIMIT = 20;

type VehicleFormCustomerPickerProps = {
  disabled: boolean;
  portalContainer: React.RefObject<HTMLDivElement | null>;
  onSelectionChange: (customerId: string) => void;
};

function VehicleFormCustomerPicker({
  disabled,
  portalContainer,
  onSelectionChange,
}: VehicleFormCustomerPickerProps) {
  const [customerLabel, setCustomerLabel] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const { data: customerOptions, isPending: isLoadingCustomerOptions } = useListCustomerOptions({
    limit: CUSTOMER_OPTIONS_LIMIT,
    search: customerSearch || undefined,
  });

  const customerOptionsItems = useMemo(
    () =>
      customerOptions?.customers?.map((option) => ({
        label: option.label,
        value: option.id,
      })) ?? [],
    [customerOptions],
  );

  const handleCustomerSelect = (option: ComboboxItemOption | null) => {
    onSelectionChange(option?.value ?? "");
  };

  const emptyMessage = isLoadingCustomerOptions
    ? "Buscando clientes..."
    : "Nenhum cliente encontrado.";

  return (
    <Combobox
      value={customerLabel}
      onValueChange={setCustomerLabel}
      onDebouncedValueChange={setCustomerSearch}
      onSelectedItemChange={handleCustomerSelect}
      items={customerOptionsItems}
      portalContainer={portalContainer}
      placeholder="Digite o nome do cliente"
      emptyMessage={emptyMessage}
      autoComplete="off"
      disabled={disabled}
      required
      aria-label="Selecionar cliente"
      className="w-full"
    />
  );
}

type VehicleFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: string;
  lockedCustomerLabel?: string;
  showCustomerPicker?: boolean;
  formSessionKey?: number;
  editingVehicle: VehicleDto | null;
};

export function VehicleFormSheet({
  open,
  onOpenChange,
  customerId = "",
  lockedCustomerLabel,
  showCustomerPicker = false,
  formSessionKey = 0,
  editingVehicle,
}: VehicleFormSheetProps) {
  const sheetContentRef = useRef<HTMLDivElement>(null);
  const [selectionByPickerKey, setSelectionByPickerKey] = useState<Record<string, string>>({});

  const { mutate: createMutate, isPending: isCreatePending } = useCreateVehicle();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateVehicle();

  const isEditMode = Boolean(editingVehicle?.id);
  const isPending = isCreatePending || isUpdatePending;
  const shouldShowCustomerPicker = showCustomerPicker && !isEditMode;
  const isCustomerLocked = !isEditMode && Boolean(customerId) && !showCustomerPicker;
  const shouldShowCustomerField = shouldShowCustomerPicker || isCustomerLocked;
  const lockedCustomerDisplayLabel = lockedCustomerLabel?.trim() || "Cliente selecionado";

  const customerPickerKey = shouldShowCustomerPicker ? `picker-${formSessionKey}` : "";
  const selectedCustomerId = customerPickerKey
    ? (selectionByPickerKey[customerPickerKey] ?? "")
    : "";

  const handlePickerSelectionChange = useCallback(
    (id: string) => {
      if (!customerPickerKey) return;
      setSelectionByPickerKey((current) => ({ ...current, [customerPickerKey]: id }));
    },
    [customerPickerKey],
  );

  const methods = useForm<VehicleFormInput, undefined, VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema) as Resolver<
      VehicleFormInput,
      undefined,
      VehicleFormValues
    >,
    defaultValues: vehicleFormDefaultValues,
    mode: isEditMode ? "onChange" : "onBlur",
    reValidateMode: "onChange",
  });

  const { control, handleSubmit, reset, formState } = methods;
  const { isDirty } = formState;
  const fieldControl = control as unknown as Control<FieldValues>;

  useEffect(() => {
    if (!open) return;

    if (editingVehicle?.id) {
      reset(vehicleToFormDefaults(editingVehicle));
      return;
    }

    reset(vehicleFormDefaultValues);
  }, [open, editingVehicle, reset]);

  const resolveCreateCustomerId = () => {
    if (shouldShowCustomerPicker) return selectedCustomerId;
    return customerId;
  };

  const onSubmit = handleSubmit((values) => {
    if (isEditMode && editingVehicle?.id) {
      updateMutate(
        { customerId: editingVehicle.customerId, vehicleId: editingVehicle.id, values },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }

    const targetCustomerId = resolveCreateCustomerId();
    if (!targetCustomerId) return;

    createMutate(
      { customerId: targetCustomerId, values },
      { onSuccess: () => onOpenChange(false) },
    );
  });

  const canSubmitCreate = !shouldShowCustomerPicker || Boolean(selectedCustomerId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={sheetContentRef}
        className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>{isEditMode ? "Editar veículo" : "Novo veículo"}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Atualize os dados do veículo."
              : isCustomerLocked
                ? "Cliente definido pela linha selecionada. Preencha os dados do novo veículo."
                : shouldShowCustomerPicker
                  ? "Selecione o cliente e preencha os dados do veículo."
                  : "Preencha os dados do veículo."}
          </SheetDescription>
        </SheetHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-6 py-6">
            <div className="space-y-4">
              {shouldShowCustomerField ? (
                <div className="space-y-2">
                  <Label>
                    Cliente
                    <span aria-hidden="true" className="ml-1 text-destructive">
                      *
                    </span>
                  </Label>
                  {isCustomerLocked ? (
                    <Combobox
                      value={lockedCustomerDisplayLabel}
                      items={
                        customerId ? [{ label: lockedCustomerDisplayLabel, value: customerId }] : []
                      }
                      portalContainer={sheetContentRef}
                      autoComplete="off"
                      disabled
                      readOnly
                      showClear={false}
                      required
                      aria-label="Cliente selecionado"
                      className="w-full"
                    />
                  ) : (
                    <VehicleFormCustomerPicker
                      key={customerPickerKey}
                      disabled={isPending}
                      portalContainer={sheetContentRef}
                      onSelectionChange={handlePickerSelectionChange}
                    />
                  )}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={fieldControl}
                  name="plate"
                  label="Placa"
                  placeholder="ABC1234"
                />
                <InputField
                  control={fieldControl}
                  name="year"
                  label="Ano"
                  type="number"
                  min={1900}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField control={fieldControl} name="brand" label="Marca" />
                <InputField control={fieldControl} name="model" label="Modelo" />
              </div>
              <InputField control={fieldControl} name="color" label="Cor" />
              <FormField
                control={fieldControl}
                name="notes"
                label="Observações"
                renderControl={false}
              >
                {({ field }) => (
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={3}
                    placeholder="Ex.: arranhão na lateral, película, etc."
                  />
                )}
              </FormField>
            </div>

            <SheetFooter className="mt-auto flex-col gap-2 border-t border-border p-0 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={
                  isPending || (isEditMode && !isDirty) || (!isEditMode && !canSubmitCreate)
                }
              >
                {isPending ? "A guardar..." : isEditMode ? "Guardar alterações" : "Criar veículo"}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
