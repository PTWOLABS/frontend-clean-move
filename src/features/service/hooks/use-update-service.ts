"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ServiceCategoryRef } from "@/features/service-category/types";
import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { updateService } from "../api/update-service";
import {
  restoreServicesLists,
  snapshotServicesLists,
  upsertServiceInLists,
  type ServicesListSnapshotEntry,
} from "../lib/services-query-cache";
import {
  formValuesToServiceItem,
  mapCreateServiceFormToPayload,
} from "../schemas/create-service-schema";
import type { CreateServiceFormValues } from "../schemas/create-service-schema";

type UpdateServiceVariables = {
  serviceId: string;
  values: CreateServiceFormValues;
  category?: ServiceCategoryRef | null;
};

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, values }: UpdateServiceVariables) => {
      return updateService(serviceId, mapCreateServiceFormToPayload(values));
    },
    onMutate: async ({ serviceId, values, category }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.services() });
      const snapshot = snapshotServicesLists(queryClient);
      const optimistic = formValuesToServiceItem(serviceId, values, category);
      upsertServiceInLists(queryClient, serviceId, () => optimistic);
      return { snapshot } satisfies { snapshot: ServicesListSnapshotEntry[] };
    },
    onSuccess: () => {
      toast.success("Serviço atualizado com sucesso.");
    },
    onError: (error, _variables, context) => {
      restoreServicesLists(queryClient, context?.snapshot);
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          toast.error(error.message || "Verifique os dados e tente novamente.");
          return;
        }
        toast.error("Não foi possível atualizar o serviço. Tente novamente mais tarde.");
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services() });
    },
  });
}
