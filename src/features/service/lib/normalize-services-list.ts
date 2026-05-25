import type {
  ServiceItem,
  ServiceListWireItem,
  ServicesListApiResponse,
  ServicesPage,
} from "../types";

type WireOrCatalogItem = ServiceItem | ServiceListWireItem;

function pickItems(body: ServicesListApiResponse): WireOrCatalogItem[] {
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.services)) return body.services;
  return [];
}

function pickTotal(body: ServicesListApiResponse, itemsLength: number): number {
  const n = body.total ?? body.totalCount ?? body.totalItems;
  if (typeof n === "number" && Number.isFinite(n)) return n;
  return itemsLength;
}

/**
 * Converte o DTO de listagem (`name`, `priceInCents`, etc.) para o modelo usado na UI (`serviceName`, `price`).
 */
export function mapWireToServiceItem(raw: WireOrCatalogItem): ServiceItem {
  const r = raw as ServiceItem & ServiceListWireItem;
  const serviceName = (r.serviceName ?? r.name ?? "").trim();
  const description = r.description == null ? undefined : String(r.description).trim() || undefined;
  const category = r.category == null ? "" : String(r.category);
  const min = r.estimatedDuration?.minInMinutes ?? 0;
  const maxRaw = r.estimatedDuration?.maxInMinutes;
  const max = maxRaw != null && Number.isFinite(Number(maxRaw)) ? Number(maxRaw) : min;
  const price = r.price ?? r.priceInCents;

  return {
    id: r.id,
    serviceName,
    description,
    category,
    estimatedDuration:
      r.estimatedDuration == null ? undefined : { minInMinutes: min, maxInMinutes: max },
    price,
    isActive: r.isActive ?? false,
  };
}

/**
 * Aceita corpo paginado com `items` | `data` | `services` e `total` | `totalCount`,
 * ou um array simples (fallback sem metadados de total).
 */
export function normalizeServicesList(
  body: ServicesListApiResponse | ServiceItem[] | null | undefined,
  page: number,
  size: number,
): ServicesPage {
  if (body == null) {
    return { items: [], total: 0, page, size };
  }
  if (Array.isArray(body)) {
    const items = body.map(mapWireToServiceItem);
    return { items, total: items.length, page, size };
  }
  const rawItems = pickItems(body);
  const items = rawItems.map(mapWireToServiceItem);
  const total = pickTotal(body, items.length);
  return { items, total, page, size };
}
