/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import type { EstablishmentServiceItem } from "../types";

import {
  establishmentServiceItemToDuplicateFormDefaults,
  establishmentServiceItemToFormDefaults,
} from "./create-service-schema";

const baseItem: EstablishmentServiceItem = {
  id: "svc-1",
  serviceName: "Lavagem Completa",
  description: "Inclui aspiração",
  category: "WASH",
  estimatedDuration: { minInMinutes: 60, maxInMinutes: 60 },
  price: 6500,
  isActive: true,
};

describe("establishmentServiceItemToDuplicateFormDefaults", () => {
  it("prefixes service name with Cópia de", () => {
    const result = establishmentServiceItemToDuplicateFormDefaults(baseItem);

    expect(result.serviceName).toBe("Cópia de Lavagem Completa");
    expect(result.description).toBe(establishmentServiceItemToFormDefaults(baseItem).description);
    expect(result.category).toBe("WASH");
    expect(result.priceInReais).toBe("65,00");
    expect(result.isActive).toBe(true);
  });

  it("does not double-prefix when name already starts with Cópia de", () => {
    const result = establishmentServiceItemToDuplicateFormDefaults({
      ...baseItem,
      serviceName: "Cópia de Lavagem Completa",
    });

    expect(result.serviceName).toBe("Cópia de Lavagem Completa");
  });
});
