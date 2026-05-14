/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { normalizeEstablishmentServicesList } from "./normalize-services-list";
import type { EstablishmentServiceItem, EstablishmentServiceListWireItem } from "../types";

const sampleItem: EstablishmentServiceItem = {
  id: "1",
  serviceName: "Lavagem",
  category: "WASH",
  estimatedDuration: { minInMinutes: 30, maxInMinutes: 60 },
  price: 3000,
  isActive: true,
};

describe("normalizeEstablishmentServicesList", () => {
  it("normalizes items + total", () => {
    const out = normalizeEstablishmentServicesList({ items: [sampleItem], total: 42 }, 2, 20);
    expect(out).toEqual({
      items: [sampleItem],
      total: 42,
      page: 2,
      size: 20,
    });
  });

  it("supports data + totalCount", () => {
    const out = normalizeEstablishmentServicesList({ data: [sampleItem], totalCount: 5 }, 1, 20);
    expect(out.items).toEqual([sampleItem]);
    expect(out.total).toBe(5);
  });

  it("supports raw array body", () => {
    const out = normalizeEstablishmentServicesList([sampleItem], 1, 20);
    expect(out.items).toEqual([sampleItem]);
    expect(out.total).toBe(1);
  });

  it("handles null body", () => {
    const out = normalizeEstablishmentServicesList(null, 1, 20);
    expect(out).toEqual({ items: [], total: 0, page: 1, size: 20 });
  });

  it("maps ServicePresenter wire shape (name, priceInCents) to catalog item", () => {
    const wire: EstablishmentServiceListWireItem = {
      id: "svc-1",
      name: "Lavagem premium",
      description: "Inclui cera",
      category: "WASH",
      estimatedDuration: { minInMinutes: 30, maxInMinutes: 60 },
      priceInCents: 4500,
      isActive: true,
    };
    const out = normalizeEstablishmentServicesList({ items: [wire], total: 1 }, 1, 20);
    expect(out.items[0]).toEqual({
      id: "svc-1",
      serviceName: "Lavagem premium",
      description: "Inclui cera",
      category: "WASH",
      estimatedDuration: { minInMinutes: 30, maxInMinutes: 60 },
      price: 4500,
      isActive: true,
    });
  });

  it("uses minInMinutes when maxInMinutes is null", () => {
    const wire: EstablishmentServiceListWireItem = {
      name: "Serviço curto",
      category: "WASH",
      estimatedDuration: { minInMinutes: 15, maxInMinutes: null },
      priceInCents: 1000,
      isActive: true,
    };
    const out = normalizeEstablishmentServicesList({ items: [wire], total: 1 }, 1, 20);
    expect(out.items[0].estimatedDuration).toEqual({ minInMinutes: 15, maxInMinutes: 15 });
  });

  it("uses totalItems when total and totalCount are absent", () => {
    const out = normalizeEstablishmentServicesList({ items: [sampleItem], totalItems: 99 }, 1, 20);
    expect(out.total).toBe(99);
  });
});
