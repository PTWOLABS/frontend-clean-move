"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, type Control, type FieldValues } from "react-hook-form";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  FormControl,
  FormField as FormFieldController,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form-primitives";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ApiError } from "@/shared/api/httpClient";

import { useCreateServiceCategory } from "../hooks/use-create-service-category";
import { useDeleteServiceCategory } from "../hooks/use-delete-service-category";
import { useServiceCategories } from "../hooks/use-service-categories";
import { useUpdateServiceCategory } from "../hooks/use-update-service-category";
import {
  serviceCategoryFormDefaultValues,
  serviceCategoryFormSchema,
  type ServiceCategoryFormValues,
} from "../schemas/service-category-form-schema";
import type { ServiceCategoryDto } from "../types";
import { ServiceCategoryListItem } from "./service-category-list-item";

type ServiceCategoryManageSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ServiceCategoryManageSheet({
  open,
  onOpenChange,
}: ServiceCategoryManageSheetProps) {
  const categoriesQuery = useServiceCategories({ enabled: open });
  const createMutation = useCreateServiceCategory();
  const updateMutation = useUpdateServiceCategory();
  const deleteMutation = useDeleteServiceCategory();

  const [renameTarget, setRenameTarget] = useState<ServiceCategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategoryDto | null>(null);

  const createForm = useForm<ServiceCategoryFormValues>({
    resolver: zodResolver(serviceCategoryFormSchema),
    defaultValues: serviceCategoryFormDefaultValues,
    mode: "onChange",
  });

  const renameForm = useForm<ServiceCategoryFormValues>({
    resolver: zodResolver(serviceCategoryFormSchema),
    defaultValues: serviceCategoryFormDefaultValues,
    mode: "onChange",
  });

  const renameFieldControl = renameForm.control as unknown as Control<FieldValues>;

  const categories = useMemo(
    () => categoriesQuery.data?.categories ?? [],
    [categoriesQuery.data?.categories],
  );

  useEffect(() => {
    if (!open) return;
    createForm.reset(serviceCategoryFormDefaultValues);
  }, [open, createForm]);

  useEffect(() => {
    if (!renameTarget) return;
    renameForm.reset({ name: renameTarget.name });
  }, [renameTarget, renameForm]);

  const handleCreate = (values: ServiceCategoryFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        createForm.reset(serviceCategoryFormDefaultValues);
      },
    });
  };

  const handleRename = (values: ServiceCategoryFormValues) => {
    if (!renameTarget) return;
    updateMutation.mutate(
      { categoryId: renameTarget.id, values },
      {
        onSuccess: () => setRenameTarget(null),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    deleteMutation.mutate(id);
  };

  const errorMessage =
    categoriesQuery.error instanceof ApiError
      ? categoriesQuery.error.message
      : "Não foi possível carregar as categorias.";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg"
        >
          <SheetHeader className="text-left">
            <SheetTitle>Categorias de serviço</SheetTitle>
            <SheetDescription>
              Organize o catálogo com categorias personalizadas. Categorias com serviços ativos não
              podem ser removidas.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-6 py-6">
            <FormProvider {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreate)}>
                <FormFieldController
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nova categoria
                        <span aria-hidden="true" className="ml-1 text-destructive">
                          *
                        </span>
                      </FormLabel>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <FormControl className="flex-1">
                          <Input
                            {...field}
                            placeholder="Ex.: Polimento"
                            autoComplete="off"
                            required
                          />
                        </FormControl>
                        <Button
                          type="submit"
                          className="h-10 w-full shrink-0 gap-2 sm:w-auto"
                          disabled={createMutation.isPending || !createForm.formState.isValid}
                        >
                          <Plus aria-hidden className="size-4" />
                          {createMutation.isPending ? "A adicionar…" : "Adicionar"}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </FormProvider>

            {categoriesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : categoriesQuery.isError ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-6 text-center">
                <p className="text-sm text-destructive">{errorMessage}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => categoriesQuery.refetch()}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : categories.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhuma categoria cadastrada. Adicione a primeira acima.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <ServiceCategoryListItem
                    key={category.id}
                    category={category}
                    onRename={setRenameTarget}
                    onDelete={setDeleteTarget}
                    isDeleting={
                      deleteMutation.isPending && deleteMutation.variables === category.id
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={renameTarget !== null} onOpenChange={(next) => !next && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear categoria</DialogTitle>
            <DialogDescription>Altere o nome exibido no catálogo de serviços.</DialogDescription>
          </DialogHeader>

          <FormProvider {...renameForm}>
            <form className="space-y-4" onSubmit={renameForm.handleSubmit(handleRename)}>
              <InputField
                control={renameFieldControl}
                name="name"
                label="Nome da categoria"
                required
                autoComplete="off"
                autoFocus
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setRenameTarget(null)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={updateMutation.isPending || !renameForm.formState.isDirty}
                  onClick={() => {
                    if (!renameTarget) return;
                    renameForm.reset({ name: renameTarget.name });
                  }}
                >
                  Descartar alterações
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || !renameForm.formState.isValid}
                >
                  {updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name ?? ""}</span> será
              removida. Não é possível apagar categorias com serviços ativos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? "A confirmar…" : "Confirmar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
