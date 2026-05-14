import type {
  EstablishmentServiceItem,
  EstablishmentServicesListApiResponse,
  EstablishmentServicesPage,
} from "../types";

function pickItems(body: EstablishmentServicesListApiResponse): EstablishmentServiceItem[] {
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.services)) return body.services;
  return [];
}

function pickTotal(body: EstablishmentServicesListApiResponse, itemsLength: number): number {
  const n = body.total ?? body.totalCount;
  if (typeof n === "number" && Number.isFinite(n)) return n;
  return itemsLength;
}

/**
 * Aceita corpo paginado com `items` | `data` | `services` e `total` | `totalCount`,
 * ou um array simples (fallback sem metadados de total).
 */
export function normalizeEstablishmentServicesList(
  body: EstablishmentServicesListApiResponse | EstablishmentServiceItem[] | null | undefined,
  page: number,
  size: number,
): EstablishmentServicesPage {
  if (body == null) {
    return { items: [], total: 0, page, size };
  }
  if (Array.isArray(body)) {
    return { items: body, total: body.length, page, size };
  }
  const items = pickItems(body);
  const total = pickTotal(body, items.length);
  return { items, total, page, size };
}
