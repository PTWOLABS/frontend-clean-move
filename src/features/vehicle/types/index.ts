export type VehicleDto = {
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

export type CustomerVehicleDto = VehicleDto;

export type ListVehiclesQuery = {
  page?: number;
  size?: number;
};

/** Campo de filtro dedicado em GET /vehicles (um param por chave). */
export type VehicleSearchType = "plate" | "name" | "model" | "brand" | "color" | "year";

export type ListEstablishmentVehiclesQuery = {
  plate?: string;
  name?: string;
  model?: string;
  brand?: string;
  color?: string;
  year?: string;
  customerId?: string;
  page?: number;
  size?: number;
};

export type ListVehiclesResponse = {
  vehicles: VehicleDto[];
  totalItems: number;
};

export type VehiclesPage = {
  items: VehicleDto[];
  total: number;
  page: number;
  size: number;
};

export type CreateVehiclePayload = {
  plate?: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  notes?: string;
};

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export type VehicleOptionsQuery = {
  search?: string;
  customerId?: string;
  limit?: number;
};

export type VehicleOption = {
  id: string;
  label: string;
};

export type VehicleOptionsResponse = {
  vehicles: VehicleOption[];
};
