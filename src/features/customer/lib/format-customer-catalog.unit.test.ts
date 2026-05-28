import { describe, expect, it } from "vitest";

import { formatVehicleName, getCustomerVehiclesCount } from "./format-customer-catalog";

describe("format-customer-catalog", () => {
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
