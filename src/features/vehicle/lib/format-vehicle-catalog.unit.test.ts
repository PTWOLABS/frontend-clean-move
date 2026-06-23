/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import {
  VEHICLE_DISPLAY_NAME_FALLBACK,
  buildVehicleDisplayName,
  formatVehicleName,
} from "./format-vehicle-catalog";

const baseVehicle = {
  id: "v1",
  establishmentId: "e1",
  customerId: "c1",
  createdAt: "",
  updatedAt: "",
};

describe("buildVehicleDisplayName", () => {
  it("returns brand and model joined", () => {
    expect(
      buildVehicleDisplayName({
        brand: "Toyota",
        model: "Corolla",
      }),
    ).toBe("Toyota Corolla");
  });

  it("returns only brand for legacy records", () => {
    expect(
      buildVehicleDisplayName({
        brand: "Toyota",
        model: "",
      }),
    ).toBe("Toyota");
  });

  it("returns only model for legacy records", () => {
    expect(
      buildVehicleDisplayName({
        brand: "",
        model: "Corolla",
      }),
    ).toBe("Corolla");
  });

  it("does not use plate as fallback", () => {
    expect(
      buildVehicleDisplayName({
        brand: "",
        model: "",
      }),
    ).toBe(VEHICLE_DISPLAY_NAME_FALLBACK);
  });

  it("returns fallback for empty object", () => {
    expect(buildVehicleDisplayName({ brand: "", model: "" })).toBe(VEHICLE_DISPLAY_NAME_FALLBACK);
  });
});

describe("formatVehicleName", () => {
  it("returns fallback when vehicle is null", () => {
    expect(formatVehicleName(null)).toBe(VEHICLE_DISPLAY_NAME_FALLBACK);
  });

  it("returns fallback when vehicle is undefined", () => {
    expect(formatVehicleName(undefined)).toBe(VEHICLE_DISPLAY_NAME_FALLBACK);
  });

  it("returns brand and model for a complete vehicle", () => {
    expect(
      formatVehicleName({
        ...baseVehicle,
        brand: "Fiat",
        model: "Uno",
        plate: "ABC1234",
      }),
    ).toBe("Fiat Uno");
  });

  it("does not use plate when brand and model are missing", () => {
    expect(
      formatVehicleName({
        ...baseVehicle,
        plate: "ABC1234",
      }),
    ).toBe(VEHICLE_DISPLAY_NAME_FALLBACK);
  });
});
