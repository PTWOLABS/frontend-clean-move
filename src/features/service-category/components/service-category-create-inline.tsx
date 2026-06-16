"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm, type Control, type FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputField } from "@/components/ui/form/input-field";

import { useCreateServiceCategory } from "../hooks/use-create-service-category";
import {
  serviceCategoryFormDefaultValues,
  serviceCategoryFormSchema,
  type ServiceCategoryFormValues,
} from "../schemas/service-category-form-schema";

const CREATE_NEW_VALUE = "__create_new__";

export { CREATE_NEW_VALUE };

type ServiceCategoryCreateInlineProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chamado após criar com sucesso, com id e nome da nova categoria. */
  onCreated?: (category: { id: string; name: string }) => void;
};

export function ServiceCategoryCreateInline({
  open,
  onOpenChange,
  onCreated,
}: ServiceCategoryCreateInlineProps) {
  const { mutate, isPending } = useCreateServiceCategory();

  const methods = useForm<ServiceCategoryFormValues>({
    resolver: zodResolver(serviceCategoryFormSchema),
    defaultValues: serviceCategoryFormDefaultValues,
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = methods;

  const fieldControl = control as unknown as Control<FieldValues>;

  useEffect(() => {
    if (!open) return;
    reset(serviceCategoryFormDefaultValues);
  }, [open, reset]);

  const onSubmit = (values: ServiceCategoryFormValues) => {
    mutate(values, {
      onSuccess: (response) => {
        onCreated?.({ id: response.category.id, name: response.category.name });
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription>
            Informe o nome da categoria. Ela ficará disponível para associar aos serviços.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              control={fieldControl}
              name="name"
              label="Nome da categoria"
              required
              placeholder="Ex.: Lavagem"
              autoComplete="off"
              autoFocus
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || !isValid}>
                {isPending ? "A criar…" : "Criar categoria"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
