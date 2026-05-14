/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { listEstablishmentServices } from "./list-establishment-services";

describe("establishment/api/list-establishment-services", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("calls GET /establishments/:ownerId with query string", async () => {
    httpClientMock.mockResolvedValueOnce({
      items: [],
      total: 0,
    });

    await listEstablishmentServices("abc-uuid", {
      page: 2,
      size: 10,
      name: "lavagem",
      isActive: true,
    });

    expect(httpClientMock).toHaveBeenCalledWith(
      "/establishments/abc-uuid?page=2&size=10&name=lavagem&isActive=true",
      { signal: undefined },
    );
  });

  it("omits isActive when undefined", async () => {
    httpClientMock.mockResolvedValueOnce({ items: [], total: 0 });
    await listEstablishmentServices("id-1", { page: 1, size: 20 });
    expect(httpClientMock).toHaveBeenCalledWith("/establishments/id-1?page=1&size=20", {
      signal: undefined,
    });
  });
});
