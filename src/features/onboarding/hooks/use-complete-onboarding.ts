"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import type { OnboardingPayload } from "../types/onboarding-types";
import { completeOnboarding } from "../api/complete-onboarding";

const establishmentQueryKey = [QUERY_KEYS.establishment()[0]] as const;

const queriesToInvalidate: QueryKey[] = [
  QUERY_KEYS.authSession,
  QUERY_KEYS.userMe(),
  establishmentQueryKey,
  QUERY_KEYS.services(),
  QUERY_KEYS.serviceOptions(),
  QUERY_KEYS.customers(),
  QUERY_KEYS.customerOptions(),
  QUERY_KEYS.vehiclesAll(),
  QUERY_KEYS.vehicleOptions(),
  QUERY_KEYS.appointments(),
  QUERY_KEYS.metricsOverview,
  QUERY_KEYS.metricsAppointment,
  QUERY_KEYS.revenueAndAppointments,
  QUERY_KEYS.popularServices,
];

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: OnboardingPayload) => {
      return await completeOnboarding(body);
    },
    onSuccess: async () => {
      await Promise.all(
        queriesToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );

      toast.success("Onboarding concluído com sucesso.");
    },
    onError: (error) => {
      const resourceKey = "onboarding";
      const resourceLabel = "o onboarding";
      const mutationType = "update";

      const feedback = getMutationFeedbackError(resourceLabel, resourceKey, error, mutationType);

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
