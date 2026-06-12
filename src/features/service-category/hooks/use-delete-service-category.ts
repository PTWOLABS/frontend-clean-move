"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

import { deleteServiceCategory } from "../api/delete-service-category";
import { invalidateServiceCategoryQueries } from "../lib/invalidate-service-category-queries";

export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => deleteServiceCategory(categoryId),
    onSuccess: () => {
      invalidateServiceCategoryQueries(queryClient);
      toast.success("Categoria removida com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 404) {
        toast.error("Categoria não encontrada.");
        return;
      }

      if (error.statusCode === 400) {
        toast.error(
          error.message ||
            "Não foi possível remover a categoria. Verifique se há serviços ativos vinculados.",
        );
        return;
      }

      toast.error("Não foi possível remover a categoria. Tente novamente mais tarde.");
    },
  });
}
