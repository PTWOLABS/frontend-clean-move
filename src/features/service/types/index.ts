export const SERVICE_CATEGORY_CODES = ["WASH", "ESTETICA", "DETAILING", "INTERIOR"] as const;

export type ServiceCategoryCode = (typeof SERVICE_CATEGORY_CODES)[number];

/** Corpo de `POST /services` (camelCase). */
export type CreateServicePayload = {
  serviceName: string;
  description?: string;
  category: ServiceCategoryCode;
  estimatedDuration: {
    minInMinutes: number;
    maxInMinutes: number;
  };
  /** Valor em centavos. */
  price: number;
  isActive: boolean;
};

/**
 * Forma possível devolvida pelo backend em listagens (`name`, `priceInCents`).
 * O frontend normaliza para {@link ServiceItem}.
 */
export type ServiceListWireItem = {
  id?: string;
  name?: string;
  establishmentId?: string;
  description?: string | null;
  category?: string | null;
  estimatedDuration?: {
    minInMinutes: number;
    maxInMinutes: number | null;
  } | null;
  priceInCents?: number;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

/** Item de serviço no catálogo (DTO da API, camelCase). */
export type ServiceItem = {
  id?: string;
  serviceName: string;
  description?: string;
  category: string;
  estimatedDuration?: {
    minInMinutes: number;
    maxInMinutes: number;
  };
  /** Valor em centavos (ex.: 3000 → R$ 30,00). */
  price?: number | string;
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
