"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { updateService } from "../api/update-service";
import {
  createServiceFormSchema,
  serviceItemToFormDefaults,
  mapCreateServiceFormToPayload,
} from "../schemas/create-service-schema";
import type { ServiceItem } from "../types";

export function useToggleServiceActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: ServiceItem) => {
      if (!item.id) {
        throw new Error("Identificador do serviço em falta.");
      }

      const formInput = serviceItemToFormDefaults(item);
      const values = createServiceFormSchema.parse({
        ...formInput,
        isActive: !item.isActive,
      });

      return updateService(item.id, mapCreateServiceFormToPayload(values));
    },
    onSuccess: (_data, item) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.services(),
      });
      toast.success(
        item.isActive ? "Serviço desativado com sucesso." : "Serviço ativado com sucesso.",
      );
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          toast.error(error.message || "Não foi possível alterar o estado do serviço.");
          return;
        }
        if (error.statusCode === 404) {
          toast.error("Serviço não encontrado.");
          return;
        }
        toast.error("Não foi possível alterar o estado do serviço. Tente novamente mais tarde.");
        return;
      }
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      }
    },
  });
}
