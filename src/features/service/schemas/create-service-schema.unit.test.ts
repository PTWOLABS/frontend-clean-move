/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import type { ServiceItem } from "../types";

import {
  createServiceFormSchema,
  formValuesToServiceItem,
  mapCreateServiceFormToPayload,
  serviceItemToDuplicateFormDefaults,
  serviceItemToFormDefaults,
} from "./create-service-schema";

const washCategory = { id: "11cf3860-d512-47db-b9d1-c9044be6250d", name: "Lavagem" };

const baseItem: ServiceItem = {
  id: "svc-1",
  serviceName: "Lavagem Completa",
  description: "Inclui aspiração",
  category: washCategory,
  estimatedDuration: { minInMinutes: 60, maxInMinutes: 60 },
  price: 6500,
  isActive: true,
};

describe("serviceItemToDuplicateFormDefaults", () => {
  it("prefixes service name with Cópia de", () => {
    const result = serviceItemToDuplicateFormDefaults(baseItem);

    expect(result.serviceName).toBe("Cópia de Lavagem Completa");
    expect(result.description).toBe(serviceItemToFormDefaults(baseItem).description);
    expect(result.categoryId).toBe("11cf3860-d512-47db-b9d1-c9044be6250d");
    expect(result.priceInReais).toBe("65,00");
    expect(result.isActive).toBe(true);
  });

  it("does not double-prefix when name already starts with Cópia de", () => {
    const result = serviceItemToDuplicateFormDefaults({
      ...baseItem,
      serviceName: "Cópia de Lavagem Completa",
    });

    expect(result.serviceName).toBe("Cópia de Lavagem Completa");
  });
});

describe("createServiceFormSchema categoryId", () => {
  it("accepts empty categoryId as optional", () => {
    const parsed = createServiceFormSchema.safeParse({
      serviceName: "Lavagem simples",
      description: "",
      categoryId: "",
      minInMinutes: 30,
      maxInMinutes: 60,
      priceInReais: "30,00",
      isActive: true,
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.categoryId).toBeUndefined();
    expect(mapCreateServiceFormToPayload(parsed.data).categoryId).toBeNull();
  });
});

describe("formValuesToServiceItem", () => {
  it("maps validated form values to ServiceItem with price in cents", () => {
    const parsed = createServiceFormSchema.parse(serviceItemToFormDefaults(baseItem));
    const item = formValuesToServiceItem("svc-1", parsed, washCategory);

    expect(item).toEqual({
      id: "svc-1",
      serviceName: "Lavagem Completa",
      description: "Inclui aspiração",
      category: washCategory,
      estimatedDuration: { minInMinutes: 60, maxInMinutes: 60 },
      price: 6500,
      isActive: true,
    });
  });

  it("rejects invalid duration via schema before mapping", () => {
    const parsed = createServiceFormSchema.safeParse({
      ...serviceItemToFormDefaults(baseItem),
      minInMinutes: 90,
      maxInMinutes: 30,
    });
    expect(parsed.success).toBe(false);
  });
});
