/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosGetMock = vi.fn();

vi.mock("axios", () => ({
  default: {
    get: (...args: unknown[]) => axiosGetMock(...args),
  },
}));

import { fetchCompanyByCnpj } from "./brasilapi";

describe("fetchCompanyByCnpj", () => {
  beforeEach(() => {
    axiosGetMock.mockReset();
  });

  it("should normalize the cnpj removing non-numeric characters before the call", async () => {
    axiosGetMock.mockResolvedValueOnce({
      status: 200,
      data: { cnpj: "12345678000190", razao_social: "Empresa LTDA", nome_fantasia: "Empresa" },
    });

    await fetchCompanyByCnpj("12.345.678/0001-90");

    expect(axiosGetMock).toHaveBeenCalledWith(
      "https://brasilapi.com.br/api/cnpj/v1/12345678000190",
      expect.any(Object),
    );
  });

  it("should return legalname and tradename when the api responds 200", async () => {
    axiosGetMock.mockResolvedValueOnce({
      status: 200,
      data: { cnpj: "12345678000190", razao_social: "Empresa LTDA", nome_fantasia: "Empresa" },
    });

    const result = await fetchCompanyByCnpj("12345678000190");

    expect(result).toEqual({
      legalName: "Empresa LTDA",
      tradeName: "Empresa",
    });
  });

  it("should fall back to legalname when tradename is null", async () => {
    axiosGetMock.mockResolvedValueOnce({
      status: 200,
      data: { cnpj: "12345678000190", razao_social: "Empresa LTDA", nome_fantasia: null },
    });

    const result = await fetchCompanyByCnpj("12345678000190");

    expect(result).toEqual({
      legalName: "Empresa LTDA",
      tradeName: "Empresa LTDA",
    });
  });

  it("should return null when the api responds 404", async () => {
    axiosGetMock.mockResolvedValueOnce({
      status: 404,
      data: { message: "not found" },
    });

    const result = await fetchCompanyByCnpj("12345678000190");
    expect(result).toBeNull();
  });

  it("should throw when the api responds with a non-2xx status", async () => {
    axiosGetMock.mockResolvedValueOnce({
      status: 500,
      data: {},
    });

    await expect(fetchCompanyByCnpj("12345678000190")).rejects.toThrow(
      "Failed to fetch company by CNPJ.",
    );
  });
});
