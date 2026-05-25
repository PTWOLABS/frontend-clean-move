"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { deleteService } from "../api/delete-service";
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
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          toast.error(error.message || "Não foi possível apagar. Tente novamente.");
          return;
        }
        if (error.statusCode === 404) {
          toast.error("Serviço não encontrado.");
          return;
        }
        toast.error("Não foi possível apagar o serviço. Tente novamente mais tarde.");
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services() });
    },
  });
}
