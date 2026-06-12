"use client";

import { useEffect, useMemo, useState } from "react";

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
  SelectSeparator,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CREATE_NEW_VALUE,
  ServiceCategoryCreateInline,
} from "@/features/service-category/components/service-category-create-inline";
import { useServiceCategoryOptions } from "@/features/service-category/hooks/use-service-category-options";
import { useFormatBrlMoney } from "@/shared/money/use-format-brl-money";

import { useCreateService } from "../hooks/use-create-service";
import { useUpdateService } from "../hooks/use-update-service";
import type { ServiceItem } from "../types";
import {
  createServiceDefaultValues,
  createServiceFormSchema,
  serviceItemToDuplicateFormDefaults,
  serviceItemToFormDefaults,
  type CreateServiceFormInput,
  type CreateServiceFormValues,
} from "../schemas/create-service-schema";

const NONE_CATEGORY_VALUE = "__none__";

type ServiceFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` = criar; com item (e `id`) = editar. */
  editingService: ServiceItem | null;
  /** Item de origem ao duplicar (abre formulário de criação pré-preenchido). */
  duplicateSource: ServiceItem | null;
  onManageCategories?: () => void;
};

export function ServiceFormSheet({
  open,
  onOpenChange,
  editingService,
  duplicateSource,
  onManageCategories,
}: ServiceFormSheetProps) {
  const { mutate: createMutate, isPending: isCreatePending } = useCreateService();
  const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateService();
  const money = useFormatBrlMoney();

  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

  const categoryOptionsQuery = useServiceCategoryOptions({
    limit: 100,
    enabled: open,
  });

  const categoryOptions = useMemo(
    () => categoryOptionsQuery.data?.categories ?? [],
    [categoryOptionsQuery.data?.categories],
  );

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

  const { control, handleSubmit, reset, setValue, formState } = methods;
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
      const selectedOption = values.categoryId
        ? categoryOptions.find((option) => option.id === values.categoryId)
        : null;
      updateMutate(
        {
          serviceId,
          values,
          category: selectedOption ? { id: selectedOption.id, name: selectedOption.label } : null,
        },
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

  const handleCategoryChange = (value: string) => {
    if (value === CREATE_NEW_VALUE) {
      setCreateCategoryOpen(true);
      return;
    }
    if (value === NONE_CATEGORY_VALUE) {
      setValue("categoryId", "", { shouldDirty: true, shouldValidate: true });
      return;
    }
    setValue("categoryId", value, { shouldDirty: true, shouldValidate: true });
  };

  const handleCategoryCreated = (category: { id: string; name: string }) => {
    setValue("categoryId", category.id, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg"
        >
          <SheetHeader className="text-left">
            <SheetTitle>
              {isEditMode
                ? "Editar serviço"
                : isDuplicateMode
                  ? "Duplicar serviço"
                  : "Novo serviço"}
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

                <div className="space-y-2">
                  <FormField
                    control={fieldControl}
                    name="categoryId"
                    label="Categoria"
                    renderControl={false}
                  >
                    {({ field }) =>
                      categoryOptionsQuery.isLoading ? (
                        <Skeleton className="h-10 w-full rounded-md" />
                      ) : (
                        <Select
                          value={field.value || NONE_CATEGORY_VALUE}
                          onValueChange={handleCategoryChange}
                        >
                          <SelectTrigger id={field.name} className="w-full">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE_CATEGORY_VALUE}>Nenhuma</SelectItem>
                            {categoryOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                            <SelectSeparator />
                            <SelectItem value={CREATE_NEW_VALUE}>Criar nova categoria…</SelectItem>
                          </SelectContent>
                        </Select>
                      )
                    }
                  </FormField>

                  {onManageCategories ? (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-sm text-muted-foreground"
                      onClick={onManageCategories}
                    >
                      Gerir categorias
                    </Button>
                  ) : null}
                </div>

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
                  disabled={isPending || (isEditMode && !isDirty) || categoryOptionsQuery.isLoading}
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

      <ServiceCategoryCreateInline
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
        onCreated={handleCategoryCreated}
      />
    </>
  );
}
