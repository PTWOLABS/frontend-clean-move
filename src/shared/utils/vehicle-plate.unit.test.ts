import { describe, expect, it } from "vitest";

import { normalizeVehiclePlate } from "./vehicle-plate";

describe("normalizeVehiclePlate", () => {
  it("normalizes plates to uppercase without separators", () => {
    expect(normalizeVehiclePlate(" abc-1d23 ")).toBe("ABC1D23");
  });

  it("removes non-alphanumeric characters", () => {
    expect(normalizeVehiclePlate("a*b.c-123")).toBe("ABC123");
  });

  it("returns undefined for empty values", () => {
    expect(normalizeVehiclePlate(null)).toBeUndefined();
    expect(normalizeVehiclePlate(undefined)).toBeUndefined();
    expect(normalizeVehiclePlate(" - ")).toBeUndefined();
  });
});
