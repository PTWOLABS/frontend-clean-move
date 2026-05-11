import axios from "axios";

type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export type ViaCepAddress = {
  street: string;
  city: string;
  state: string;
  complement: string;
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export async function fetchAddressByZipCode(
  zipCode: string,
  signal?: AbortSignal,
): Promise<ViaCepAddress | null> {
  const normalizedZipCode = onlyDigits(zipCode);

  try {
    const { data } = await axios.get<ViaCepResponse>(
      `https://viacep.com.br/ws/${normalizedZipCode}/json/`,
      { signal },
    );

    if (data.erro) {
      return null;
    }

    return {
      street: data.logradouro,
      city: data.localidade,
      state: data.uf,
      complement: data.complemento,
    };
  } catch {
    throw new Error("Failed to fetch address by zip code.");
  }
}
