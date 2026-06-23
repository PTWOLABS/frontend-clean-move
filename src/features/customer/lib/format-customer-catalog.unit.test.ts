import { describe, expect, it } from "vitest";

import { buildVehicleDisplayName } from "@/features/vehicle/lib/format-vehicle-catalog";

import {
  formatVehicleName,
  formatPhone,
  formatOptionalContact,
  getCustomerVehiclesCount,
} from "./format-customer-catalog";

const baseVehicle = {
  id: "v1",
  establishmentId: "e1",
  customerId: "c1",
  createdAt: "",
  updatedAt: "",
};

describe("format-customer-catalog", () => {
  it("formatPhone returns em dash when value is null or empty", () => {
    expect(formatPhone(null)).toBe("-");
    expect(formatPhone("")).toBe("-");
    expect(formatPhone("   ")).toBe("-");
  });

  it("formatPhone formats 11-digit numbers", () => {
    expect(formatPhone("11999991234")).toBe("(11) 99999-1234");
  });

  it("formatPhone formats 10-digit numbers", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });

  it("formatOptionalContact returns em dash when value is null or empty", () => {
    expect(formatOptionalContact(null)).toBe("-");
    expect(formatOptionalContact("")).toBe("-");
    expect(formatOptionalContact("cliente@email.com")).toBe("cliente@email.com");
  });

  it("formatVehicleName returns brand and model", () => {
    expect(
      formatVehicleName({
        ...baseVehicle,
        brand: "Toyota",
        model: "Corolla",
      }),
    ).toBe("Toyota Corolla");
  });

  it("formatVehicleName returns Sem veículo when vehicle is null", () => {
    expect(formatVehicleName(null)).toBe("Sem veículo");
  });

  it("formatVehicleName matches buildVehicleDisplayName for the same vehicle", () => {
    const vehicle = {
      ...baseVehicle,
      brand: "Honda",
      model: "Civic",
    };

    expect(formatVehicleName(vehicle)).toBe(buildVehicleDisplayName(vehicle));
  });

  it("formatVehicleName does not use plate when brand and model are missing", () => {
    expect(
      formatVehicleName({
        ...baseVehicle,
        plate: "ABC1234",
      }),
    ).toBe("—");
  });

  it("getCustomerVehiclesCount prefers vehiclesCount from API", () => {
    expect(
      getCustomerVehiclesCount({
        vehicles: [{ id: "v1" } as never],
        vehiclesCount: 5,
      }),
    ).toBe(5);
  });
});
