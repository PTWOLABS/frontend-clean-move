"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  type Control,
  type FieldValues,
  type Resolver,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
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

type VehicleFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  editingVehicle: VehicleDto | null;
};

export function VehicleFormSheet({
  open,
  onOpenChange,
  customerId,
  editingVehicle,
}: VehicleFormSheetProps) {
  const { mutate: createMutate, isPending: isCreatePending } = useCreateVehicle();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateVehicle();

  const isEditMode = Boolean(editingVehicle?.id);
  const isPending = isCreatePending || isUpdatePending;

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
    } else {
      reset(vehicleFormDefaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redefinir ao abrir ou ao mudar veículo em edição
  }, [open, editingVehicle?.id, reset]);

  const onSubmit = handleSubmit((values) => {
    if (isEditMode && editingVehicle?.id) {
      updateMutate(
        { customerId, vehicleId: editingVehicle.id, values },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }

    createMutate({ customerId, values }, { onSuccess: () => onOpenChange(false) });
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>{isEditMode ? "Editar veículo" : "Novo veículo"}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Atualize os dados do veículo."
              : "Preencha os dados do veículo para o cliente selecionado."}
          </SheetDescription>
        </SheetHeader>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-6 py-6">
            <div className="space-y-4">
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
                disabled={isPending || (isEditMode && !isDirty)}
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
