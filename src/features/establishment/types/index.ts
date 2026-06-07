export type Establishment = {
  id: string;
  tradeName: string | null;
  legalBusinessName: string | null;
  cnpj: string | null;
  slug: string | null;
  bannerImageUrl: string | null;
};

export type GetEstablishmentResponse = {
  establishment: Establishment;
};

export type UpdateEstablishmentPayload = Partial<
  Pick<Establishment, "tradeName" | "legalBusinessName" | "cnpj" | "slug">
>;

export type UpdateEstablishmentResponse = {
  establishment: Establishment;
};
