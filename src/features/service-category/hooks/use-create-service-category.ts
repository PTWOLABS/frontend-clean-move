"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

import { createServiceCategory } from "../api/create-service-category";
import { invalidateServiceCategoryQueries } from "../lib/invalidate-service-category-queries";
import type { ServiceCategoryFormValues } from "../schemas/service-category-form-schema";

export function useCreateServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ServiceCategoryFormValues) =>
      createServiceCategory({ name: values.name.trim() }),
    onSuccess: () => {
      invalidateServiceCategoryQueries(queryClient);
      toast.success("Categoria criada com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      if (error.statusCode === 409) {
        toast.error("Já existe uma categoria com este nome.");
        return;
      }

      if (error.statusCode === 404) {
        toast.error("Estabelecimento não encontrado.");
        return;
      }

      if (error.statusCode === 400) {
        toast.error(error.message || "Verifique o nome informado.");
        return;
      }

      toast.error("Não foi possível criar a categoria. Tente novamente mais tarde.");
    },
  });
}
