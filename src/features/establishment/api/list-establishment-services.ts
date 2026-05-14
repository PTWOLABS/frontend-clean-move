import { httpClient } from "@/shared/api/httpClient";

import { normalizeEstablishmentServicesList } from "../lib/normalize-services-list";
import type {
  EstablishmentServiceItem,
  EstablishmentServicesListApiResponse,
  EstablishmentServicesPage,
  ListEstablishmentServicesQuery,
} from "../types";

const LIST_PATH = "/establishments";

function buildQuery(params: ListEstablishmentServicesQuery): string {
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
 * Path: `GET /establishments/{ownerId}` — `ownerId` corresponde ao dono (ex.: `user.id`).
 */
export async function listEstablishmentServices(
  ownerId: string,
  params: ListEstablishmentServicesQuery = {},
  signal?: AbortSignal,
): Promise<EstablishmentServicesPage> {
  const page = params.page ?? 1;
  const size = params.size ?? 20;
  const path = `${LIST_PATH}/${ownerId}${buildQuery({ ...params, page, size })}`;
  const raw = await httpClient<EstablishmentServicesListApiResponse | EstablishmentServiceItem[]>(
    path,
    { signal },
  );
  return normalizeEstablishmentServicesList(raw, page, size);
}
