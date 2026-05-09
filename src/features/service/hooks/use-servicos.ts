import { useQuery } from "@tanstack/react-query";

import { listServicos } from "../api";

export function useServicos() {
  return useQuery({
    queryKey: ["servicos"],
    queryFn: () => listServicos(),
  });
}
