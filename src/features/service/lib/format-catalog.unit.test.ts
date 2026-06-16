/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { formatServicePriceBrl } from "./format-catalog";

describe("formatServicePriceBrl", () => {
  it("formats FIXED as BRL", () => {
    expect(formatServicePriceBrl({ type: "FIXED", fixedPriceInCents: 3000 })).toMatch(/30/);
  });

  it("formats STARTING_AT", () => {
    expect(
      formatServicePriceBrl({ type: "STARTING_AT", minPriceInCents: 25000 }),
    ).toContain("A partir de");
  });

  it("formats RANGE", () => {
    expect(
      formatServicePriceBrl({
        type: "RANGE",
        minPriceInCents: 30000,
        maxPriceInCents: 60000,
      }),
    ).toContain(" - ");
  });
});
