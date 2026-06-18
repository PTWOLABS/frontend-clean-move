"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

import { createService } from "../api/create-service";
import { getServiceMutationFeedbackError } from "../lib/service-mutation-feedback";
import { invalidateServiceQueries } from "../lib/invalidate-service-queries";
import { mapCreateServiceFormToPayload } from "../schemas/create-service-schema";
import type { CreateServiceFormValues } from "../schemas/create-service-schema";

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateServiceFormValues) => {
      return createService(mapCreateServiceFormToPayload(values));
    },
    onSuccess: () => {
      invalidateServiceQueries(queryClient);
      toast.success("Serviço criado com sucesso.");
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;

      const feedback = getServiceMutationFeedbackError(error, "create");
      toast.error(feedback.title, {
        id: feedback.id,
        ...(feedback.description ? { description: feedback.description } : {}),
      });
    },
  });
}
