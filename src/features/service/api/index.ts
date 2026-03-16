import { httpClient } from "@/shared/api/httpClient";

import type { Servico } from "../types";

export async function listServicos() {
  return httpClient<Servico[]>("/servicos");
}

