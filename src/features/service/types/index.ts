import type { ServiceCategoryRef } from "@/features/service-category/types";

export type { ServiceCategoryRef };

export type FixedPriceSpecification = {
  type: "FIXED";
  fixedPriceInCents: number;
};

export type StartingAtPriceSpecification = {
  type: "STARTING_AT";
  minPriceInCents: number;
};

export type RangePriceSpecification = {
  type: "RANGE";
  minPriceInCents: number;
  maxPriceInCents: number;
};

export type ServicePriceSpecification =
  | FixedPriceSpecification
  | StartingAtPriceSpecification
  | RangePriceSpecification;

export type EstimatedDurationPayload = {
  minInMinutes: number;
  maxInMinutes?: number;
};

/**
 * Corpo de `POST /services`.
 * Enviar exatamente um entre `price` e `priceSpecification`.
 */
export type CreateServicePayload = {
  serviceName: string;
  description?: string;
  categoryId?: string | null;
  estimatedDuration?: EstimatedDurationPayload;
  price?: number;
  priceSpecification?: ServicePriceSpecification;
  isActive?: boolean;
};

/** Corpo de `PATCH /services/:serviceId` — todos opcionais, pelo menos 1 campo. */
export type UpdateServicePayload = Partial<CreateServicePayload>;

export type CreateServiceResponse = {
  service: ServiceDto;
};

export type UpdateServiceResponse = {
  service: ServiceDto;
};

/** Resposta da API (`ServiceDto`). Normalizado para {@link ServiceItem} na UI. */
export type ServiceDto = {
  id: string;
  establishmentId: string;
  name: string;
  description?: string | null;
  category: ServiceCategoryRef | null;
  estimatedDuration: {
    minInMinutes: number;
    maxInMinutes: number | null;
  } | null;
  priceInCents?: number;
  priceSpecification: ServicePriceSpecification | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Forma possível devolvida pelo backend em listagens (inclui aliases legados).
 * O frontend normaliza para {@link ServiceItem}.
 */
export type ServiceListWireItem = Partial<ServiceDto> & {
  serviceName?: string;
  /** @deprecated usar `priceInCents` */
  price?: number;
  priceSpecification?: Partial<ServicePriceSpecification> | null;
};

/**
 * Item de serviço no catálogo (modelo de UI).
 * Derivado de {@link ServiceDto} via `mapServiceDtoToServiceItem`.
 */
export type ServiceItem = {
  id?: string;
  serviceName: string;
  description?: string;
  category: ServiceCategoryRef | null;
  estimatedDuration?: {
    minInMinutes: number;
    maxInMinutes: number;
  };
  priceSpecification: ServicePriceSpecification;
  isActive: boolean;
};

export type ListServicesQuery = {
  page?: number;
  size?: number;
  /** Match parcial case-insensitive no nome. */
  name?: string;
  /** Omitir = todos; caso contrário filtra por ativo/inativo. */
  isActive?: boolean;
};

/** Resposta normalizada no frontend após `listServices`. */
export type ServicesPage = {
  items: ServiceItem[];
  total: number;
  page: number;
  size: number;
};

/** Formas comuns devolvidas pelo backend antes da normalização. */
export type ServicesListApiResponse = {
  items?: Array<ServiceItem | ServiceListWireItem>;
  data?: Array<ServiceItem | ServiceListWireItem>;
  services?: Array<ServiceItem | ServiceListWireItem>;
  totalItems?: number;
  total?: number;
  totalCount?: number;
};
