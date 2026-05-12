export type RegisterEstablishmentAddressPayload = {
  street: string;
  complement: string;
  country: string;
  state: string;
  zipCode: string;
  city: string;
};

export type RegisterEstablishmentPayload = {
  name: string;
  tradeName: string;
  legalBusinessName: string;
  email: string;
  password: string;
  cnpj: string;
  phone: string;
  address: RegisterEstablishmentAddressPayload;
  slug: string;
};

export type RegisterEstablishmentResponse = {
  establishmentId: string;
};
