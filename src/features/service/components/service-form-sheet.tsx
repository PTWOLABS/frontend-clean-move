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
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form/field";
import { InputField } from "@/components/ui/form/input-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/primitives";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatServiceCategory } from "../lib/format-catalog";
import { SERVICE_CATEGORY_CODES } from "../types";
import type { ServiceItem } from "../types";
import { useFormatBrlMoney } from "@/shared/money/use-format-brl-money";

import { useCreateService } from "../hooks/use-create-service";
import { useUpdateService } from "../hooks/use-update-service";
import {
  createServiceDefaultValues,
  createServiceFormSchema,
  serviceItemToDuplicateFormDefaults,
  serviceItemToFormDefaults,
  type CreateServiceFormInput,
  type CreateServiceFormValues,
} from "../schemas/create-service-schema";

type ServiceFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` = criar; com item (e `id`) = editar. */
  editingService: ServiceItem | null;
  /** Item de origem ao duplicar (abre formulário de criação pré-preenchido). */
  duplicateSource: ServiceItem | null;
};

export function ServiceFormSheet({
  open,
  onOpenChange,
  editingService,
  duplicateSource,
}: ServiceFormSheetProps) {
  const { mutate: createMutate, isPending: isCreatePending } = useCreateService();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateService();
  const money = useFormatBrlMoney();

  const isEditMode = Boolean(editingService?.id);
  const isDuplicateMode = Boolean(duplicateSource) && !isEditMode;
  const isPending = isCreatePending || isUpdatePending;

  const methods = useForm<CreateServiceFormInput, undefined, CreateServiceFormValues>({
    resolver: zodResolver(createServiceFormSchema) as Resolver<
      CreateServiceFormInput,
      undefined,
      CreateServiceFormValues
    >,
    defaultValues: createServiceDefaultValues,
    mode: isEditMode ? "onChange" : "onBlur",
    reValidateMode: "onChange",
  });

  const { control, handleSubmit, reset, formState } = methods;
  const { isDirty } = formState;
  const fieldControl = control as unknown as Control<FieldValues>;

  useEffect(() => {
    if (!open) return;
    if (editingService?.id) {
      reset(serviceItemToFormDefaults(editingService));
    } else if (duplicateSource) {
      reset(serviceItemToDuplicateFormDefaults(duplicateSource));
    } else {
      reset(createServiceDefaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redefinir ao abrir ou ao mudar modo (editar / duplicar / criar)
  }, [open, editingService?.id, duplicateSource, reset]);

  const closeSheetAfterSave = () => {
    reset(createServiceDefaultValues);
    onOpenChange(false);
  };

  const onSubmit = (values: CreateServiceFormValues) => {
    if (isEditMode) {
      const serviceId = editingService?.id;
      if (!serviceId) {
        toast.error("Identificador do serviço em falta. Atualize a página.");
        return;
      }
      if (!isDirty) {
        toast.info("Nenhuma alteração para guardar.");
        return;
      }
      updateMutate(
        { serviceId, values },
        {
          onSuccess: closeSheetAfterSave,
        },
      );
      return;
    }

    createMutate(values, {
      onSuccess: closeSheetAfterSave,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="text-left">
          <SheetTitle>
            {isEditMode ? "Editar serviço" : isDuplicateMode ? "Duplicar serviço" : "Novo serviço"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Altere os campos abaixo. O preço usa formato brasileiro (ex.: 30,00); o sistema guarda o valor em centavos."
              : isDuplicateMode
                ? "Revise os dados copiados do serviço original. Ao guardar, será criado um novo serviço no catálogo."
                : "Preencha os dados abaixo. Para o preço use formato brasileiro (ex.: 30,00 ou 1.234,56); o sistema guarda o valor em centavos."}
          </SheetDescription>
        </SheetHeader>

        <FormProvider {...methods}>
          <form className="flex flex-1 flex-col gap-6 py-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <InputField
                control={fieldControl}
                name="serviceName"
                label="Nome do serviço"
                required
                placeholder="Ex.: Lavagem premium"
                autoComplete="off"
              />

              <FormField
                control={fieldControl}
                name="description"
                label="Descrição"
                renderControl={false}
              >
                {({ field }) => (
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Descreva o que está incluído neste serviço."
                    rows={4}
                    className="resize-y"
                  />
                )}
              </FormField>

              <FormField
                control={fieldControl}
                name="category"
                label="Categoria"
                renderControl={false}
              >
                {({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORY_CODES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {formatServiceCategory(code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={fieldControl}
                  name="minInMinutes"
                  label="Duração mín. (min)"
                  required
                  type="number"
                  min={1}
                  inputMode="numeric"
                />
                <InputField
                  control={fieldControl}
                  name="maxInMinutes"
                  label="Duração máx. (min)"
                  required
                  type="number"
                  min={1}
                  inputMode="numeric"
                />
              </div>

              <FormField control={fieldControl} name="priceInReais" label="Preço (R$)" required>
                {({ field }) => (
                  <Input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0,00"
                    className="tabular-nums"
                    value={typeof field.value === "string" ? field.value : ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={() => {
                      field.onBlur();
                      const n = money.parseToReais(String(field.value ?? ""));
                      if (Number.isFinite(n) && n > 0) {
                        field.onChange(money.formatReaisToInput(n));
                      }
                    }}
                  />
                )}
              </FormField>

              <FormField
                control={fieldControl}
                name="isActive"
                label="Serviço ativo no catálogo"
                className="flex flex-row items-center justify-between rounded-lg border border-border p-4"
                renderControl={false}
              >
                {({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Serviço ativo no catálogo"
                    className="shrink-0"
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
                {isPending
                  ? "A guardar…"
                  : isEditMode
                    ? "Guardar alterações"
                    : isDuplicateMode
                      ? "Criar cópia"
                      : "Criar serviço"}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}
