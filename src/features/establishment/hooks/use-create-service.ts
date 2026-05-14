"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

import { createService } from "../api/create-service";
import { mapCreateServiceFormToPayload } from "../schemas/create-service-schema";
import type { CreateServiceFormValues } from "../schemas/create-service-schema";

export function useCreateService(ownerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateServiceFormValues) => {
      return createService(mapCreateServiceFormToPayload(values));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["establishments", ownerId, "services"],
      });
      toast.success("Serviço criado com sucesso.");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          toast.error(error.message || "Verifique os dados e tente novamente.");
          return;
        }
        toast.error("Não foi possível criar o serviço. Tente novamente mais tarde.");
      }
    },
  });
}
