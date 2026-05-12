/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const httpClientMock = vi.fn();

vi.mock("@/shared/api/httpClient", () => ({
  httpClient: (...args: unknown[]) => httpClientMock(...args),
}));

import { registerEstablishment } from "./establishment";

describe("register/api/establishment", () => {
  beforeEach(() => {
    httpClientMock.mockReset();
  });

  it("should post to /register/establishment with the payload", async () => {
    httpClientMock.mockResolvedValueOnce({
      establishmentId: "b2955e61-179f-40a4-8852-ef185e4ab671",
    });

    const payload = {
      name: "Studio Clean Move",
      tradeName: "Studio Clean Move",
      legalBusinessName: "Studio Clean Move Servicos LTDA",
      email: "contato@cleanmove.com",
      password: "12345678",
      cnpj: "38280634000118",
      phone: "11988888888",
      address: {
        street: "Rua das Flores, 123",
        complement: "Sala 12",
        country: "Brasil",
        state: "SP",
        zipCode: "01001-000",
        city: "Sao Paulo",
      },
      slug: "studio-clean-move",
    };

    const response = await registerEstablishment(payload);

    expect(httpClientMock).toHaveBeenCalledWith("/register/establishment", {
      method: "POST",
      body: payload,
    });
    expect(response).toEqual({
      establishmentId: "b2955e61-179f-40a4-8852-ef185e4ab671",
    });
  });
});
