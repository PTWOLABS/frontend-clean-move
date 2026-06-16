/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ServiceDto, UpdateServicePayload } from "../types";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { updateService } from "./update-service";

const serviceDto: ServiceDto = {
  id: "svc-uuid-1",
  establishmentId: "est-1",
  name: "Lavagem",
  description: null,
  category: null,
  estimatedDuration: { minInMinutes: 30, maxInMinutes: 60 },
  priceInCents: 3000,
  priceSpecification: { type: "FIXED", fixedPriceInCents: 3000 },
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("service/api/update-service", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("calls PATCH /services/:id with full body", async () => {
    httpClientMock.mockResolvedValueOnce({ service: serviceDto });

    const body: UpdateServicePayload = {
      serviceName: "Lavagem",
      categoryId: "11cf3860-d512-47db-b9d1-c9044be6250d",
      estimatedDuration: { minInMinutes: 30, maxInMinutes: 60 },
      priceSpecification: { type: "FIXED", fixedPriceInCents: 3000 },
      isActive: true,
    };

    const result = await updateService("svc-uuid-1", body);

    expect(httpClientMock).toHaveBeenCalledWith("/services/svc-uuid-1", {
      method: "PATCH",
      body,
    });
    expect(result.service.serviceName).toBe("Lavagem");
  });

  it("accepts partial PATCH body with only isActive", async () => {
    httpClientMock.mockResolvedValueOnce({
      service: { ...serviceDto, isActive: false },
    });

    await updateService("svc-uuid-1", { isActive: false });

    expect(httpClientMock).toHaveBeenCalledWith("/services/svc-uuid-1", {
      method: "PATCH",
      body: { isActive: false },
    });
  });

  it("rejects empty PATCH body", async () => {
    await expect(updateService("svc-uuid-1", {})).rejects.toThrow(
      "O corpo do PATCH deve incluir pelo menos um campo.",
    );
    expect(httpClientMock).not.toHaveBeenCalled();
  });

  it("rejects sending price and priceSpecification together", async () => {
    await expect(
      updateService("svc-uuid-1", {
        price: 1000,
        priceSpecification: { type: "FIXED", fixedPriceInCents: 1000 },
      }),
    ).rejects.toThrow("Não é possível enviar `price` e `priceSpecification` no mesmo PATCH.");
    expect(httpClientMock).not.toHaveBeenCalled();
  });
});
