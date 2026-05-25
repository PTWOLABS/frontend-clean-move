/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import type { ServiceItem } from "../types";

import {
  serviceItemToDuplicateFormDefaults,
  serviceItemToFormDefaults,
} from "./create-service-schema";

const baseItem: ServiceItem = {
  id: "svc-1",
  serviceName: "Lavagem Completa",
  description: "Inclui aspiração",
  category: "WASH",
  estimatedDuration: { minInMinutes: 60, maxInMinutes: 60 },
  price: 6500,
  isActive: true,
};

describe("serviceItemToDuplicateFormDefaults", () => {
  it("prefixes service name with Cópia de", () => {
    const result = serviceItemToDuplicateFormDefaults(baseItem);

    expect(result.serviceName).toBe("Cópia de Lavagem Completa");
    expect(result.description).toBe(serviceItemToFormDefaults(baseItem).description);
    expect(result.category).toBe("WASH");
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
