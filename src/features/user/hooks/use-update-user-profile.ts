"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { updateUserProfile } from "../api";
import type { UpdateUserProfilePayload, User } from "../types";

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserProfilePayload) => updateUserProfile(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(QUERY_KEYS.userMe(), user);
      toast.success("Configurações salvas com sucesso.");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 409) {
          toast.error("E-mail, CNPJ ou slug já em uso.");
          return;
        }

        if (error.statusCode === 400) {
          toast.error(error.message || "Verifique os dados informados.");
          return;
        }
      }

      const feedback = getMutationFeedbackError(
        "configurações",
        QUERY_KEYS.userMe()[0],
        error,
        "update",
      );

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}

export type { User };
