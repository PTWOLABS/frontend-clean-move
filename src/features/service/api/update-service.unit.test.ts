/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateServicePayload } from "../types";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { updateService } from "./update-service";

describe("service/api/update-service", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("calls PATCH /services/:id with body", async () => {
    httpClientMock.mockResolvedValueOnce({});

    const body: CreateServicePayload = {
      serviceName: "Lavagem",
      categoryId: "11cf3860-d512-47db-b9d1-c9044be6250d",
      estimatedDuration: { minInMinutes: 30, maxInMinutes: 60 },
      priceSpecification: { type: "FIXED", fixedPriceInCents: 3000 },
      isActive: true,
    };

    await updateService("svc-uuid-1", body);

    expect(httpClientMock).toHaveBeenCalledWith("/services/svc-uuid-1", {
      method: "PATCH",
      body,
    });
  });
});
