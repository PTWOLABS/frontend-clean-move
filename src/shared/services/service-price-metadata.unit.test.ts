import { describe, expect, it } from "vitest";

import {
  formatServicePriceMetadataDescription,
  getServicePriceValidationIssue,
  isFixedServicePrice,
  resolveServicePriceMetadata,
} from "./service-price-metadata";

describe("service price metadata", () => {
  it("resolves fixed price specifications", () => {
    expect(
      resolveServicePriceMetadata({
        priceSpecification: { type: "FIXED", fixedPriceInCents: 9000 },
      }),
    ).toEqual({ priceType: "FIXED", minPriceInCents: 9000 });
  });

  it("resolves starting-at price specifications", () => {
    expect(
      resolveServicePriceMetadata({
        priceSpecification: { type: "STARTING_AT", minPriceInCents: 4000 },
      }),
    ).toEqual({ priceType: "STARTING_AT", minPriceInCents: 4000 });
  });

  it("resolves range price specifications", () => {
    expect(
      resolveServicePriceMetadata({
        priceSpecification: { type: "RANGE", minPriceInCents: 5000, maxPriceInCents: 10000 },
      }),
    ).toEqual({ priceType: "RANGE", minPriceInCents: 5000, maxPriceInCents: 10000 });
  });

  it("falls back to legacy priceInCents as a non-negative fixed price", () => {
    expect(resolveServicePriceMetadata({ priceInCents: -100 })).toEqual({
      priceType: "FIXED",
      minPriceInCents: 0,
    });
  });

  it("identifies fixed price metadata", () => {
    expect(isFixedServicePrice({ priceType: "FIXED", minPriceInCents: 9000 })).toBe(true);
    expect(isFixedServicePrice({ priceType: "STARTING_AT", minPriceInCents: 9000 })).toBe(false);
  });

  it("validates prices against minimum and maximum metadata", () => {
    expect(
      getServicePriceValidationIssue(3999, {
        priceType: "STARTING_AT",
        minPriceInCents: 4000,
      }),
    ).toBe("BELOW_MIN");

    expect(
      getServicePriceValidationIssue(10001, {
        priceType: "RANGE",
        minPriceInCents: 4000,
        maxPriceInCents: 10000,
      }),
    ).toBe("ABOVE_MAX");

    expect(
      getServicePriceValidationIssue(7000, {
        priceType: "RANGE",
        minPriceInCents: 4000,
        maxPriceInCents: 10000,
      }),
    ).toBeNull();
  });

  it("formats service price descriptions", () => {
    expect(
      formatServicePriceMetadataDescription({ priceType: "FIXED", minPriceInCents: 9000 }),
    ).toBe("Valor fixo: 90,00");
    expect(
      formatServicePriceMetadataDescription({ priceType: "STARTING_AT", minPriceInCents: 4000 }),
    ).toBe("Mínimo permitido: 40,00");
    expect(
      formatServicePriceMetadataDescription({
        priceType: "RANGE",
        minPriceInCents: 4000,
        maxPriceInCents: 9000,
      }),
    ).toBe("Permitido: 40,00 a 90,00");
  });
});
