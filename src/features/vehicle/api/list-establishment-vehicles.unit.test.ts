/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { listEstablishmentVehicles } from "./list-establishment-vehicles";

describe("vehicle/api/list-establishment-vehicles", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("calls GET /vehicles with pagination query", async () => {
    httpClientMock.mockResolvedValue({
      vehicles: [],
      totalItems: 0,
    });

    await listEstablishmentVehicles({ page: 2, size: 10 });

    expect(httpClientMock).toHaveBeenCalledWith("/vehicles?page=2&size=10", {
      signal: undefined,
    });
  });

  it("includes customerId and name filters when provided", async () => {
    httpClientMock.mockResolvedValue({
      vehicles: [],
      totalItems: 0,
    });

    await listEstablishmentVehicles({
      customerId: "customer-1",
      name: "Maria",
      page: 1,
      size: 20,
    });

    expect(httpClientMock).toHaveBeenCalledWith(
      "/vehicles?customerId=customer-1&name=Maria&page=1&size=20",
      { signal: undefined },
    );
  });

  it("includes plate filter independently", async () => {
    httpClientMock.mockResolvedValue({
      vehicles: [],
      totalItems: 0,
    });

    await listEstablishmentVehicles({
      plate: "abc-1d23",
      page: 1,
      size: 10,
    });

    expect(httpClientMock).toHaveBeenCalledWith("/vehicles?plate=abc-1d23&page=1&size=10", {
      signal: undefined,
    });
  });

  it("returns normalized page", async () => {
    httpClientMock.mockResolvedValue({
      vehicles: [
        {
          id: "v1",
          establishmentId: "e1",
          customerId: "customer-1",
          plate: "ABC1234",
          createdAt: "",
          updatedAt: "",
        },
      ],
      totalItems: 1,
    });

    const page = await listEstablishmentVehicles({ page: 1, size: 10 });

    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
    expect(page.page).toBe(1);
    expect(page.size).toBe(10);
  });
});
