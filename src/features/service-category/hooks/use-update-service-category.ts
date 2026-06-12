"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

import { updateServiceCategory } from "../api/update-service-category";
import { invalidateServiceCategoryQueries } from "../lib/invalidate-service-category-queries";
import type { ServiceCategoryFormValues } from "../schemas/service-category-form-schema";

type UpdateServiceCategoryVariables = {
  categoryId: string;
  values: ServiceCategoryFormValues;
};

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, values }: UpdateServiceCategoryVariables) =>
      updateServiceCategory(categoryId, { name: values.name.trim() }),
    onSuccess: () => {
      invalidateServiceCategoryQueries(queryClient);
      toast.success("Categoria atualizada com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 409) {
        toast.error("Já existe uma categoria com este nome.");
        return;
      }

      if (error.statusCode === 404) {
        toast.error("Categoria não encontrada.");
        return;
      }

      if (error.statusCode === 400) {
        toast.error(error.message || "Verifique o nome informado.");
        return;
      }

      toast.error("Não foi possível atualizar a categoria. Tente novamente mais tarde.");
    },
  });
}
