import { describe, expect, it } from "vitest";

import { hasFormStepChanges } from "./has-form-step-changes";

describe("hasFormStepChanges", () => {
  it("treats empty string, null and undefined as unchanged empty values", () => {
    expect(hasFormStepChanges({ name: "", document: undefined }, { name: null })).toBe(false);
  });

  it("ignores surrounding whitespace in strings", () => {
    expect(hasFormStepChanges({ name: "  Maria  " }, { name: "Maria" })).toBe(false);
  });

  it("detects nested object changes", () => {
    expect(
      hasFormStepChanges(
        { customer: { name: "Maria" }, vehicle: { brand: "" } },
        { customer: { name: "" }, vehicle: { brand: "" } },
      ),
    ).toBe(true);
  });

  it("detects array item changes", () => {
    expect(
      hasFormStepChanges(
        { services: [{ serviceName: "Lavagem", priceInCents: 1000 }] },
        { services: [] },
      ),
    ).toBe(true);
  });

  it("compares dates by timestamp", () => {
    expect(
      hasFormStepChanges(
        { startsAt: new Date("2026-07-06T12:00:00.000Z") },
        { startsAt: new Date("2026-07-06T12:00:00.000Z") },
      ),
    ).toBe(false);
  });
});
