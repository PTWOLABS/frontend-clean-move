import { httpClient } from "@/shared/api/httpClient";

import { normalizeServicesList } from "../lib/normalize-services-list";
import type {
  ListServicesQuery,
  ServiceItem,
  ServicesListApiResponse,
  ServicesPage,
} from "../types";

const LIST_PATH = "/services";

function buildQuery(params: ListServicesQuery): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.size != null) search.set("size", String(params.size));
  if (params.name != null && params.name.trim() !== "") {
    search.set("name", params.name.trim());
  }
  if (params.isActive !== undefined) {
    search.set("isActive", params.isActive ? "true" : "false");
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Lista serviços do estabelecimento (paginação e filtros no backend).
 * Path: `GET /services/{establishmentId}` — `establishmentId` vem de `GET /user/me`.
 */
export async function listServices(
  establishmentId: string,
  params: ListServicesQuery = {},
  signal?: AbortSignal,
): Promise<ServicesPage> {
  const page = params.page ?? 1;
  const size = params.size ?? 5;
  const path = `${LIST_PATH}/${establishmentId}${buildQuery({ ...params, page, size })}`;
  const raw = await httpClient<ServicesListApiResponse | ServiceItem[]>(path, { signal });
  return normalizeServicesList(raw, page, size);
}
