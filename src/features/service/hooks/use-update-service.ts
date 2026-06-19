"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ServiceCategoryRef } from "@/features/service-category/types";
import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { updateService } from "../api/update-service";
import { getServiceMutationFeedbackError } from "../lib/service-mutation-feedback";
import { invalidateServiceQueries } from "../lib/invalidate-service-queries";
import {
  restoreServicesLists,
  snapshotServicesLists,
  upsertServiceInLists,
  type ServicesListSnapshotEntry,
} from "../lib/services-query-cache";
import {
  formValuesToServiceItem,
  mapCreateServiceFormToUpdatePayload,
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
      return updateService(serviceId, mapCreateServiceFormToUpdatePayload(values));
    },
    onMutate: async ({ serviceId, values, category }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.services() });
      const snapshot = snapshotServicesLists(queryClient);
      const optimistic = formValuesToServiceItem(serviceId, values, category);
      upsertServiceInLists(queryClient, serviceId, () => optimistic);
      return { snapshot } satisfies { snapshot: ServicesListSnapshotEntry[] };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments() });
      toast.success("Serviço atualizado com sucesso.");
    },
    onError: (error, _variables, context) => {
      restoreServicesLists(queryClient, context?.snapshot);
      if (!(error instanceof ApiError)) return;

      const feedback = getServiceMutationFeedbackError(error, "update");
      toast.error(feedback.title, {
        id: feedback.id,
        ...(feedback.description ? { description: feedback.description } : {}),
      });
    },
    onSettled: () => {
      invalidateServiceQueries(queryClient);
    },
  });
}
