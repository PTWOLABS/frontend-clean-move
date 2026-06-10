"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { User } from "@/features/user/types";
import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";

import { deleteUserProfileImage } from "../api/delete-user-profile-image";

export function useDeleteUserProfileImage() {
  const queryClient = useQueryClient();

  const syncProfileImageRemoved = () => {
    queryClient.setQueryData<User | undefined>(QUERY_KEYS.userMe(), (current) => {
      if (!current) return current;

      return {
        ...current,
        profileImageUrl: null,
      };
    });

    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userMe() });
  };

  return useMutation({
    mutationFn: () => deleteUserProfileImage(),
    onSuccess: () => {
      syncProfileImageRemoved();
      toast.success("Foto de perfil removida com sucesso.");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 404) {
        syncProfileImageRemoved();
        toast.success("Foto de perfil removida com sucesso.");
        return;
      }

      const feedback = getMutationFeedbackError(
        "foto de perfil",
        QUERY_KEYS.userMe()[0],
        error,
        "delete",
      );

      toast.error(feedback.title, {
        id: feedback.id,
        ...(feedback.description ? { description: feedback.description } : {}),
      });
    },
  });
}
