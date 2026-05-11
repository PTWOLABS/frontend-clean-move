import axios from "axios";

type BrasilApiCnpjResponse = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
};

export type BrasilApiCompany = {
  legalName: string;
  tradeName: string;
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export async function fetchCompanyByCnpj(
  cnpj: string,
  signal?: AbortSignal,
): Promise<BrasilApiCompany | null> {
  const normalizedCnpj = onlyDigits(cnpj);

  const { data, status } = await axios.get<BrasilApiCnpjResponse>(
    `https://brasilapi.com.br/api/cnpj/v1/${normalizedCnpj}`,
    {
      signal,
      validateStatus: () => true,
    },
  );

  if (status === 404) {
    return null;
  }

  if (status < 200 || status >= 300) {
    throw new Error("Failed to fetch company by CNPJ.");
  }

  return {
    legalName: data.razao_social,
    tradeName: data.nome_fantasia || data.razao_social,
  };
}
