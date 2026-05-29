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

type VehicleFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: string;
  showCustomerPicker?: boolean;
  editingVehicle: VehicleDto | null;
};

export function VehicleFormSheet({
  open,
  onOpenChange,
  customerId = "",
  showCustomerPicker = false,
  editingVehicle,
}: VehicleFormSheetProps) {
  const sheetContentRef = useRef<HTMLDivElement>(null);
  const [customerLabel, setCustomerLabel] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { mutate: createMutate, isPending: isCreatePending } = useCreateVehicle();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateVehicle();

  const isEditMode = Boolean(editingVehicle?.id);
  const isPending = isCreatePending || isUpdatePending;
  const shouldShowCustomerPicker = showCustomerPicker && !isEditMode;

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

  const resetCustomerPicker = useCallback(() => {
    setCustomerLabel("");
    setCustomerSearch("");
    setSelectedCustomerId("");
  }, []);

  useEffect(() => {
    if (!open) return;
    if (editingVehicle?.id) {
      reset(vehicleToFormDefaults(editingVehicle));
      resetCustomerPicker();
      return;
    }

    reset(vehicleFormDefaultValues);
    resetCustomerPicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redefinir ao abrir ou ao mudar veículo em edição
  }, [open, editingVehicle?.id, reset, resetCustomerPicker]);

  const handleCustomerSelect = (option: ComboboxItemOption | null) => {
    setSelectedCustomerId(option?.value ?? "");
  };

  const getCustomerEmptyMessage = () => {
    if (isLoadingCustomerOptions) return "Buscando clientes...";

    return "Nenhum cliente encontrado.";
  };

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

    createMutate({ customerId: targetCustomerId, values }, { onSuccess: () => onOpenChange(false) });
  });

  const canSubmitCreate =
    !shouldShowCustomerPicker || Boolean(selectedCustomerId);

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
              : shouldShowCustomerPicker
                ? "Selecione o cliente e preencha os dados do veículo."
                : "Preencha os dados do veículo para o cliente selecionado."}
          </SheetDescription>
        </SheetHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-6 py-6">
            <div className="space-y-4">
              {shouldShowCustomerPicker ? (
                <div className="space-y-2">
                  <Label>
                    Cliente
                    <span aria-hidden="true" className="ml-1 text-destructive">
                      *
                    </span>
                  </Label>
                  <Combobox
                    value={customerLabel}
                    onValueChange={setCustomerLabel}
                    onDebouncedValueChange={setCustomerSearch}
                    onSelectedItemChange={handleCustomerSelect}
                    items={customerOptionsItems}
                    portalContainer={sheetContentRef}
                    placeholder="Digite o nome do cliente"
                    emptyMessage={getCustomerEmptyMessage()}
                    autoComplete="off"
                    disabled={isPending}
                    required
                    aria-label="Selecionar cliente"
                    className="w-full"
                  />
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
                  isPending ||
                  (isEditMode && !isDirty) ||
                  (!isEditMode && !canSubmitCreate)
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
