"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type Control, type FieldValues, type Resolver } from "react-hook-form";
import { toast } from "sonner";

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

import { useCreateCustomer } from "../hooks/use-create-customer";
import { useUpdateCustomer } from "../hooks/use-update-customer";
import {
  customerFormDefaultValues,
  customerFormSchema,
  customerToFormDefaults,
  type CustomerFormInput,
  type CustomerFormValues,
} from "../schemas/customer-form-schema";
import type { CustomerWithPrimaryVehicle } from "../types";

type CustomerFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer: CustomerWithPrimaryVehicle | null;
};

export function CustomerFormSheet({ open, onOpenChange, editingCustomer }: CustomerFormSheetProps) {
  const { mutate: createMutate, isPending: isCreatePending } = useCreateCustomer();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateCustomer();

  const isEditMode = Boolean(editingCustomer?.id);
  const isPending = isCreatePending || isUpdatePending;

  const methods = useForm<CustomerFormInput, undefined, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema) as Resolver<CustomerFormInput, undefined, CustomerFormValues>,
    defaultValues: customerFormDefaultValues,
    mode: isEditMode ? "onChange" : "onBlur",
    reValidateMode: "onChange",
  });

  const { control, reset, handleSubmit, formState } = methods;
  const { isDirty } = formState;
  const fieldControl = control as unknown as Control<FieldValues>;

  useEffect(() => {
    if (!open) return;

    if (editingCustomer) {
      reset(customerToFormDefaults(editingCustomer, editingCustomer.primaryVehicle));
      return;
    }

    reset(customerFormDefaultValues);
  }, [open, editingCustomer, reset]);

  const handleCloseAfterSave = () => {
    reset(customerFormDefaultValues);
    onOpenChange(false);
  };

  const onSubmit = (values: CustomerFormValues) => {
    if (isEditMode) {
      if (!editingCustomer?.id) {
        toast.error("Identificador do cliente em falta. Atualize a página.");
        return;
      }

      if (!isDirty) {
        toast.info("Nenhuma alteração para guardar.");
        return;
      }

      updateMutate(
        { customerId: editingCustomer.id, values },
        {
          onSuccess: handleCloseAfterSave,
        },
      );
      return;
    }

    createMutate(values, {
      onSuccess: handleCloseAfterSave,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle>{isEditMode ? "Editar cliente" : "Novo cliente"}</SheetTitle>
          <SheetDescription>
            Preencha os dados do cliente e, se desejar, cadastre também o veículo principal.
          </SheetDescription>
        </SheetHeader>

        <FormProvider {...methods}>
          <form className="flex flex-1 flex-col gap-6 py-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <InputField
                control={fieldControl}
                name="fullName"
                label="Nome completo"
                required
                placeholder="Ex.: João da Silva"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={fieldControl}
                  name="phone"
                  label="Telefone"
                  required
                  mask="(__) _____-____"
                  inputMode="tel"
                />
                <InputField
                  control={fieldControl}
                  name="email"
                  label="E-mail"
                  required
                  type="email"
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={fieldControl}
                  name="cpfCnpj"
                  label="CPF/CNPJ"
                  placeholder="Somente números"
                />
                <InputField
                  control={fieldControl}
                  name="nickname"
                  label="Apelido"
                  placeholder="Como prefere ser chamado"
                />
              </div>
              <InputField control={fieldControl} name="birthDate" label="Data de nascimento" type="date" />
            </div>

            <div className="space-y-4 rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground">Endereço</h3>
              <InputField control={fieldControl} name="address.street" label="Rua" />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField control={fieldControl} name="address.city" label="Cidade" />
                <InputField control={fieldControl} name="address.state" label="UF" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField control={fieldControl} name="address.zipCode" label="CEP" />
                <InputField control={fieldControl} name="address.country" label="País" />
              </div>
              <InputField control={fieldControl} name="address.complement" label="Complemento" />
            </div>

            <div className="space-y-4 rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground">Veículo principal (opcional)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField control={fieldControl} name="vehicle.plate" label="Placa" placeholder="ABC1234" />
                <InputField control={fieldControl} name="vehicle.year" label="Ano" type="number" min={1900} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField control={fieldControl} name="vehicle.brand" label="Marca" />
                <InputField control={fieldControl} name="vehicle.model" label="Modelo" />
              </div>
              <InputField control={fieldControl} name="vehicle.color" label="Cor" />
              <FormField
                control={fieldControl}
                name="vehicle.notes"
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
                {isPending ? "A guardar..." : isEditMode ? "Guardar alterações" : "Criar cliente"}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
