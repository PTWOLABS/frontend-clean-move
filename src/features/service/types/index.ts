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

/** Corpo de `POST /services` (camelCase). */
export type CreateServicePayload = {
  serviceName: string;
  description?: string;
  categoryId?: string | null;
  estimatedDuration: {
    minInMinutes: number;
    maxInMinutes: number;
  };
  priceSpecification: ServicePriceSpecification;
  isActive: boolean;
};

/**
 * Forma possível devolvida pelo backend em listagens (`name`, `priceInCents`).
 * O frontend normaliza para {@link ServiceItem}.
 */
export type ServiceListWireItem = {
  id?: string;
  name?: string;
  serviceName?: string;
  establishmentId?: string;
  description?: string | null;
  category?: ServiceCategoryRef | null;
  estimatedDuration?: {
    minInMinutes: number;
    maxInMinutes: number | null;
  } | null;
  priceInCents?: number;
  price?: number;
  priceSpecification?: Partial<ServicePriceSpecification> | null;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

/** Item de serviço no catálogo (DTO da API, camelCase). */
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
