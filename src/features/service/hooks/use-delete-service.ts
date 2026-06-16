"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { deleteService } from "../api/delete-service";
import { getServiceMutationFeedbackError } from "../lib/service-mutation-feedback";
import {
  removeServiceFromLists,
  restoreServicesLists,
  snapshotServicesLists,
  type ServicesListSnapshotEntry,
} from "../lib/services-query-cache";

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => deleteService(serviceId),
    onMutate: async (serviceId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.services() });
      const snapshot = snapshotServicesLists(queryClient);
      removeServiceFromLists(queryClient, serviceId);
      return { snapshot } satisfies { snapshot: ServicesListSnapshotEntry[] };
    },
    onSuccess: () => {
      toast.success("Serviço eliminado com sucesso.");
    },
    onError: (error, _serviceId, context) => {
      restoreServicesLists(queryClient, context?.snapshot);
      if (!(error instanceof ApiError)) return;

      const feedback = getServiceMutationFeedbackError(error, "delete");
      toast.error(feedback.title, {
        id: feedback.id,
        ...(feedback.description ? { description: feedback.description } : {}),
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services() });
    },
  });
}
