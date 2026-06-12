/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { normalizeServicesList } from "./normalize-services-list";
import type { ServiceItem, ServiceListWireItem } from "../types";

const washCategory = { id: "11cf3860-d512-47db-b9d1-c9044be6250d", name: "Lavagem" };

const sampleItem: ServiceItem = {
  id: "1",
  serviceName: "Lavagem",
  category: washCategory,
  estimatedDuration: { minInMinutes: 30, maxInMinutes: 60 },
  price: 3000,
  isActive: true,
};

describe("normalizeServicesList", () => {
  it("normalizes items + total", () => {
    const out = normalizeServicesList({ items: [sampleItem], total: 42 }, 2, 20);
    expect(out).toEqual({
      items: [sampleItem],
      total: 42,
      page: 2,
      size: 20,
    });
  });

  it("supports data + totalCount", () => {
    const out = normalizeServicesList({ data: [sampleItem], totalCount: 5 }, 1, 20);
    expect(out.items).toEqual([sampleItem]);
    expect(out.total).toBe(5);
  });

  it("supports raw array body", () => {
    const out = normalizeServicesList([sampleItem], 1, 20);
    expect(out.items).toEqual([sampleItem]);
    expect(out.total).toBe(1);
  });

  it("handles null body", () => {
    const out = normalizeServicesList(null, 1, 20);
    expect(out).toEqual({ items: [], total: 0, page: 1, size: 20 });
  });

  it("maps ServicePresenter wire shape (name, priceInCents) to catalog item", () => {
    const wire: ServiceListWireItem = {
      id: "svc-1",
      name: "Lavagem premium",
      description: "Inclui cera",
      category: washCategory,
      estimatedDuration: { minInMinutes: 30, maxInMinutes: 60 },
      priceInCents: 4500,
      isActive: true,
    };
    const out = normalizeServicesList({ items: [wire], total: 1 }, 1, 20);
    expect(out.items[0]).toEqual({
      id: "svc-1",
      serviceName: "Lavagem premium",
      description: "Inclui cera",
      category: washCategory,
      estimatedDuration: { minInMinutes: 30, maxInMinutes: 60 },
      price: 4500,
      isActive: true,
    });
  });

  it("uses minInMinutes when maxInMinutes is null", () => {
    const wire: ServiceListWireItem = {
      name: "Serviço curto",
      category: washCategory,
      estimatedDuration: { minInMinutes: 15, maxInMinutes: null },
      priceInCents: 1000,
      isActive: true,
    };
    const out = normalizeServicesList({ items: [wire], total: 1 }, 1, 20);
    expect(out.items[0].estimatedDuration).toEqual({ minInMinutes: 15, maxInMinutes: 15 });
  });

  it("uses totalItems when total and totalCount are absent", () => {
    const out = normalizeServicesList({ items: [sampleItem], totalItems: 99 }, 1, 20);
    expect(out.total).toBe(99);
  });
});
