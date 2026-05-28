import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleDto,
} from "@/features/vehicle/types";

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

export type CustomerVehicleDto = VehicleDto;

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

export type CreateCustomerVehiclePayload = CreateVehiclePayload;

export type UpdateCustomerVehiclePayload = UpdateVehiclePayload;

export type CustomerWithPrimaryVehicle = CustomerDto & {
  primaryVehicle?: CustomerVehicleDto | null;
};
