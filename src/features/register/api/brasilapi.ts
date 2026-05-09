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

  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${normalizedCnpj}`, {
    signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch company by CNPJ.");
  }

  const company = (await response.json()) as BrasilApiCnpjResponse;

  return {
    legalName: company.razao_social,
    tradeName: company.nome_fantasia || company.razao_social,
  };
}
