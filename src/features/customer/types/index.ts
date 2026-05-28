export type CustomerAddress = {
  street: string;
  complement?: string | null;
  country: string;
  state: string;
  zipCode: string;
  city: string;
};

export type DocumentType = "CPF" | "CNPJ" | string;

export type CustomerDto = {
  id: string;
  establishmentId: string;
  profileImageUrl?: string | null;
  cpfCnpj?: string | null;
  documentType?: DocumentType | null;
  fullName: string;
  phone: string;
  email: string;
  address?: CustomerAddress | null;
  birthDate?: string | null;
  nickname?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  vehicles?: CustomerVehicleDto[];
  vehiclesCount?: number;
};

export type CustomerVehicleDto = {
  id: string;
  establishmentId: string;
  customerId: string;
  imageUrl?: string | null;
  plate?: string | null;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  year?: number | null;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListCustomersQuery = {
  search?: string;
  page?: number;
  size?: number;
};

export type ListCustomerVehiclesQuery = {
  page?: number;
  size?: number;
};

export type ListCustomersResponse = {
  customers: CustomerDto[];
  totalItems: number;
};

export type ListCustomerVehiclesResponse = {
  vehicles: CustomerVehicleDto[];
  totalItems: number;
};

/** Resposta normalizada no frontend após `listCustomers`. */
export type CustomersPage = {
  items: CustomerWithPrimaryVehicle[];
  total: number;
  page: number;
  size: number;
};

export type CreateCustomerPayload = {
  fullName: string;
  phone: string;
  email: string;
  cpfCnpj?: string | null;
  address?: CustomerAddress | null;
  birthDate?: string | null;
  nickname?: string | null;
};

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export type CreateCustomerVehiclePayload = {
  plate?: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  notes?: string;
};

export type UpdateCustomerVehiclePayload = Partial<CreateCustomerVehiclePayload>;

export type CustomerWithPrimaryVehicle = CustomerDto & {
  primaryVehicle?: CustomerVehicleDto | null;
};
