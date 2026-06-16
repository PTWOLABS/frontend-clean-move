/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { listVehicles } from "./list-vehicles";

describe("vehicle/api/list-vehicles", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("calls GET with customer id and pagination query", async () => {
    httpClientMock.mockResolvedValue({
      vehicles: [],
      totalItems: 0,
    });

    await listVehicles("customer-1", { page: 2, size: 10 });

    expect(httpClientMock).toHaveBeenCalledWith("/customers/customer-1/vehicles", {
      signal: undefined,
      filters: { page: 2, size: 10 },
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

    const page = await listVehicles("customer-1", { page: 1, size: 10 });

    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
    expect(page.page).toBe(1);
    expect(page.size).toBe(10);
  });
});
