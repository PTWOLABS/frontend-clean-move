"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { updateService } from "../api/update-service";
import { getServiceMutationFeedbackError } from "../lib/service-mutation-feedback";
import type { ServiceItem } from "../types";

export function useToggleServiceActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: ServiceItem) => {
      if (!item.id) {
        throw new Error("Identificador do serviço em falta.");
      }

      return updateService(item.id, { isActive: !item.isActive });
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
      if (error instanceof Error && !(error instanceof ApiError) && error.message) {
        toast.error(error.message);
        return;
      }

      if (!(error instanceof ApiError)) return;

      const feedback = getServiceMutationFeedbackError(error, "update");
      toast.error(feedback.title, {
        id: feedback.id,
        ...(feedback.description ? { description: feedback.description } : {}),
      });
    },
  });
}
