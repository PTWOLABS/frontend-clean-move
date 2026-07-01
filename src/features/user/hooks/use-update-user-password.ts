import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { finalizeSessionCleanup } from "@/features/auth/lib/finalize-session-cleanup";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { updateUserPassword } from "../api";

export function useUpdateUserPassword() {
  const router = useRouter();
  const queryClient = useQueryClient();

  function cleanupSession() {
    finalizeSessionCleanup({ queryClient, router });
  }

  const { mutate, isPending } = useMutation({
    mutationFn: updateUserPassword,
    mutationKey: QUERY_KEYS.updateUserPassword,
    onSuccess: () => {
      toast.success("Senha atualizada com sucesso.");
      cleanupSession();
    },
  });

  return {
    mutate,
    isPending,
    finalizeSessionCleanup: cleanupSession,
  };
}
