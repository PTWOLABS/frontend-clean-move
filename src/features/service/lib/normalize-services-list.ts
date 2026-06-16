import type { ServiceCategoryRef } from "@/features/service-category/types";

import type {
  ServiceDto,
  ServiceItem,
  ServicePriceSpecification,
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

function normalizeCategory(raw: unknown): ServiceCategoryRef | null {
  if (raw == null || typeof raw !== "object") return null;

  const category = raw as { id?: unknown; name?: unknown };
  const id = category.id == null ? "" : String(category.id).trim();
  const name = category.name == null ? "" : String(category.name).trim();

  if (!id) return null;
  return { id, name: name || id };
}

function normalizePriceSpecification(raw: WireOrCatalogItem): ServicePriceSpecification {
  const r = raw as ServiceItem & ServiceListWireItem;
  const candidate = r.priceSpecification;
  if (candidate?.type === "FIXED" && Number.isFinite(candidate.fixedPriceInCents)) {
    return {
      type: "FIXED",
      fixedPriceInCents: Math.round(candidate.fixedPriceInCents),
    };
  }
  if (candidate?.type === "STARTING_AT" && Number.isFinite(candidate.minPriceInCents)) {
    return {
      type: "STARTING_AT",
      minPriceInCents: Math.round(candidate.minPriceInCents),
    };
  }
  if (
    candidate?.type === "RANGE" &&
    Number.isFinite(candidate.minPriceInCents) &&
    Number.isFinite(candidate.maxPriceInCents)
  ) {
    const min = Math.round(candidate.minPriceInCents);
    const max = Math.round(candidate.maxPriceInCents);
    return {
      type: "RANGE",
      minPriceInCents: Math.min(min, max),
      maxPriceInCents: Math.max(min, max),
    };
  }

  const legacyPrice = r.price ?? r.priceInCents;
  const fallback = Number.isFinite(Number(legacyPrice)) ? Math.round(Number(legacyPrice)) : 0;
  return {
    type: "FIXED",
    fixedPriceInCents: Math.max(0, fallback),
  };
}

export function mapWireToServiceItem(raw: WireOrCatalogItem): ServiceItem {
  const r = raw as ServiceItem & ServiceListWireItem;
  const serviceName = (r.serviceName ?? r.name ?? "").trim();
  const description = r.description == null ? undefined : String(r.description).trim() || undefined;
  const category = normalizeCategory(r.category);
  const min = r.estimatedDuration?.minInMinutes ?? 0;
  const maxRaw = r.estimatedDuration?.maxInMinutes;
  const max = maxRaw != null && Number.isFinite(Number(maxRaw)) ? Number(maxRaw) : min;

  return {
    id: r.id,
    serviceName,
    description,
    category,
    estimatedDuration:
      r.estimatedDuration == null ? undefined : { minInMinutes: min, maxInMinutes: max },
    priceSpecification: normalizePriceSpecification(r),
    isActive: r.isActive ?? false,
  };
}

/** Converte {@link ServiceDto} da API para o modelo de UI. */
export function mapServiceDtoToServiceItem(dto: ServiceDto): ServiceItem {
  return mapWireToServiceItem(dto);
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
