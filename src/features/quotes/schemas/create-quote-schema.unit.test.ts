import { describe, expect, it } from "vitest";

import { quoteServicesStepSchema } from "./create-quote-schema";

const serviceId = "00000000-0000-4000-8000-000000000001";

describe("quoteServicesStepSchema", () => {
  it("accepts an existing fixed-price service", () => {
    const result = quoteServicesStepSchema.safeParse({
      services: [
        {
          serviceId,
          serviceLabel: "Lavagem completa",
          priceInCents: 9000,
          priceType: "FIXED",
          minPriceInCents: 9000,
          isCourtesy: false,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a starting-at service price below the minimum", () => {
    const result = quoteServicesStepSchema.safeParse({
      services: [
        {
          serviceId,
          serviceLabel: "Lavagem completa",
          priceInCents: 3999,
          priceType: "STARTING_AT",
          minPriceInCents: 4000,
          isCourtesy: false,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote service validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "O valor não pode ser menor que o mínimo do serviço.",
          path: ["services", 0, "priceInCents"],
        }),
      ]),
    );
  });

  it("rejects a range service price above the maximum", () => {
    const result = quoteServicesStepSchema.safeParse({
      services: [
        {
          serviceId,
          serviceLabel: "Polimento",
          priceInCents: 10001,
          priceType: "RANGE",
          minPriceInCents: 4000,
          maxPriceInCents: 10000,
          isCourtesy: false,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote service validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "O valor não pode ultrapassar o máximo do serviço.",
          path: ["services", 0, "priceInCents"],
        }),
      ]),
    );
  });

  it("skips minimum and maximum validation for courtesy services", () => {
    const result = quoteServicesStepSchema.safeParse({
      services: [
        {
          serviceId,
          serviceLabel: "Polimento",
          priceInCents: 0,
          priceType: "RANGE",
          minPriceInCents: 4000,
          maxPriceInCents: 10000,
          isCourtesy: true,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
