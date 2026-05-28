import { describe, expect, it } from "vitest";

import { normalizeCustomersList } from "./normalize-customers-list";

describe("normalizeCustomersList", () => {
  it("maps customers, totalItems and primaryVehicle from vehicles", () => {
    const result = normalizeCustomersList(
      {
        customers: [
          {
            id: "c1",
            vehicles: [{ id: "v1", plate: "ABC1234", brand: "Toyota", model: "Corolla" } as never],
            vehiclesCount: 2,
          } as never,
        ],
        totalItems: 42,
      },
      2,
      10,
    );

    expect(result.total).toBe(42);
    expect(result.page).toBe(2);
    expect(result.size).toBe(10);
    expect(result.items[0]?.id).toBe("c1");
    expect(result.items[0]?.primaryVehicle?.id).toBe("v1");
    expect(result.items[0]?.vehiclesCount).toBe(2);
  });

  it("returns empty page when body is null", () => {
    expect(normalizeCustomersList(null, 1, 10)).toEqual({
      items: [],
      total: 0,
      page: 1,
      size: 10,
    });
  });
});
