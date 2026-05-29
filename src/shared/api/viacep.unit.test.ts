/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosGetMock = vi.fn();

vi.mock("axios", () => ({
  default: {
    get: (...args: unknown[]) => axiosGetMock(...args),
  },
}));

import { fetchAddressByZipCode } from "./viacep";

describe("fetchAddressByZipCode", () => {
  beforeEach(() => {
    axiosGetMock.mockReset();
  });

  it("should normalize the zipcode removing non-numeric characters", async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        cep: "01310-100",
        logradouro: "Av. Paulista",
        complemento: "Sala 1",
        bairro: "Bela Vista",
        localidade: "São Paulo",
        uf: "SP",
      },
    });

    await fetchAddressByZipCode("01310-100");

    expect(axiosGetMock).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/01310100/json/",
      expect.any(Object),
    );
  });

  it("should return the address mapped to camelcase", async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        cep: "01310-100",
        logradouro: "Av. Paulista",
        complemento: "Sala 1",
        bairro: "Bela Vista",
        localidade: "São Paulo",
        uf: "SP",
      },
    });

    const result = await fetchAddressByZipCode("01310100");
    expect(result).toEqual({
      street: "Av. Paulista",
      city: "São Paulo",
      state: "SP",
      complement: "Sala 1",
    });
  });

  it("should return null when viacep responds with the error flag", async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: { erro: true },
    });

    const result = await fetchAddressByZipCode("00000000");
    expect(result).toBeNull();
  });

  it("should throw when the axios call fails", async () => {
    axiosGetMock.mockRejectedValueOnce(new Error("network failure"));

    await expect(fetchAddressByZipCode("01310100")).rejects.toThrow(
      "Failed to fetch address by zip code.",
    );
  });
});
