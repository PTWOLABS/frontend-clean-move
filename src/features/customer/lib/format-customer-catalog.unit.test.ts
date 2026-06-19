import { describe, expect, it } from "vitest";

import {
  formatVehicleName,
  formatPhone,
  formatOptionalContact,
  getCustomerVehiclesCount,
} from "./format-customer-catalog";

describe("format-customer-catalog", () => {
  it("formatPhone returns em dash when value is null or empty", () => {
    expect(formatPhone(null)).toBe("-");
    expect(formatPhone("")).toBe("-");
    expect(formatPhone("   ")).toBe("-");
  });

  it("formatPhone formats 11-digit numbers", () => {
    expect(formatPhone("11999991234")).toBe("(11) 99999-1234");
  });

  it("formatOptionalContact returns em dash when value is null or empty", () => {
    expect(formatOptionalContact(null)).toBe("-");
    expect(formatOptionalContact("")).toBe("-");
    expect(formatOptionalContact("cliente@email.com")).toBe("cliente@email.com");
  });

  it("formatVehicleName returns brand and model", () => {
    expect(
      formatVehicleName({
        id: "v1",
        establishmentId: "e1",
        customerId: "c1",
        brand: "Toyota",
        model: "Corolla",
        createdAt: "",
        updatedAt: "",
      }),
    ).toBe("Toyota Corolla");
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
