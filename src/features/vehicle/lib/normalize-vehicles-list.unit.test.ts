import { describe, expect, it } from "vitest";

import { normalizeVehiclesList } from "./normalize-vehicles-list";

describe("normalizeVehiclesList", () => {
  it("returns empty page when body is null", () => {
    expect(normalizeVehiclesList(null, 2, 10)).toEqual({
      items: [],
      total: 0,
      page: 2,
      size: 10,
    });
  });

  it("maps vehicles and totalItems", () => {
    const result = normalizeVehiclesList(
      {
        vehicles: [
          {
            id: "v1",
            establishmentId: "e1",
            customerId: "c1",
            createdAt: "",
            updatedAt: "",
          },
        ],
        totalItems: 5,
      },
      1,
      10,
    );

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.size).toBe(10);
  });

  it("falls back total to items length when totalItems is invalid", () => {
    const result = normalizeVehiclesList(
      {
        vehicles: [{ id: "v1" } as never],
        totalItems: Number.NaN,
      },
      1,
      10,
    );

    expect(result.total).toBe(1);
  });
});
