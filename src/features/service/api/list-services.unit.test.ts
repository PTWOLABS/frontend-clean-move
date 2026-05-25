/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { listServices } from "./list-services";

describe("service/api/list-services", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("calls GET /establishments/:ownerId with query string", async () => {
    httpClientMock.mockResolvedValueOnce({
      items: [],
      total: 0,
    });

    await listServices("abc-uuid", {
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
    await listServices("id-1", { page: 1, size: 5 });
    expect(httpClientMock).toHaveBeenCalledWith("/establishments/id-1?page=1&size=5", {
      signal: undefined,
    });
  });

  it("uses default size 5 when size is omitted", async () => {
    httpClientMock.mockResolvedValueOnce({ items: [], total: 0 });
    await listServices("id-1", { page: 1 });
    expect(httpClientMock).toHaveBeenCalledWith("/establishments/id-1?page=1&size=5", {
      signal: undefined,
    });
  });
});
