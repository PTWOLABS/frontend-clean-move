import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { setAccessToken } from "@/shared/api/httpClient";

import { updateUserPassword } from "../api";

export function useUpdateUserPassword() {
  const router = useRouter();
  const queryClient = useQueryClient();

  function finalizeSessionCleanup() {
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: QUERY_KEYS.authSession });
    queryClient.removeQueries({ queryKey: QUERY_KEYS.userMe() });
    router.replace("/login");
  }

  const { mutate, isPending } = useMutation({
    mutationFn: updateUserPassword,
    mutationKey: QUERY_KEYS.updateUserPassword,
    onSuccess: () => {
      toast.success("Senha atualizada com sucesso.");
      finalizeSessionCleanup();
    },
  });

  return {
    mutate,
    isPending,
    finalizeSessionCleanup,
  };
}
