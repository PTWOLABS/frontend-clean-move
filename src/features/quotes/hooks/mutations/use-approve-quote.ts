"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { approveQuote } from "../../api/approve-quote";
import { resolveApproveQuoteErrorFeedback } from "../../lib/approve-quote-error-feedback";
import type { ApproveQuoteBody } from "../../types/quote-approval";

type UseApproveQuoteParams = {
  quoteId: string;
} & ApproveQuoteBody;

const queriesToInvalidate: QueryKey[] = [
  QUERY_KEYS.quotes(),
  QUERY_KEYS.appointments(),
  QUERY_KEYS.metricsOverview,
  QUERY_KEYS.metricsAppointment,
  QUERY_KEYS.revenueAndAppointments,
  QUERY_KEYS.popularServices,
  QUERY_KEYS.topCustomers(),
  QUERY_KEYS.customers(),
  QUERY_KEYS.customerOptions(),
  QUERY_KEYS.vehiclesAll(),
  QUERY_KEYS.vehicleOptions(),
  QUERY_KEYS.services(),
  QUERY_KEYS.serviceOptions(),
];

export function useApproveQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: UseApproveQuoteParams) =>
      approveQuote(values.quoteId, {
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        customerResolution: values.customerResolution,
        vehicleResolution: values.vehicleResolution,
        serviceResolutions: values.serviceResolutions,
      }),
    onSuccess: async () => {
      await Promise.all(
        queriesToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );

      toast.success("Orçamento aprovado com sucesso.");
    },
    onError: (error) => {
      const feedback = resolveApproveQuoteErrorFeedback(error);

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
