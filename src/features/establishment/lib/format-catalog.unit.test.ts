/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { formatServicePriceBrl } from "./format-catalog";

describe("formatServicePriceBrl", () => {
  it("formats centavos as BRL", () => {
    expect(formatServicePriceBrl(3000)).toMatch(/30/);
  });

  it("handles undefined and invalid as zero", () => {
    expect(formatServicePriceBrl(undefined)).toBe("R$ 0,00");
    expect(formatServicePriceBrl("not-a-number")).toBe("R$ 0,00");
  });
});
