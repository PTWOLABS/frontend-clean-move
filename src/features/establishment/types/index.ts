/** Item de serviço no catálogo do estabelecimento (DTO da API, camelCase). */
export type EstablishmentServiceItem = {
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

export type ListEstablishmentServicesQuery = {
  page?: number;
  size?: number;
  /** Match parcial case-insensitive no nome. */
  name?: string;
  /** Omitir = todos; caso contrário filtra por ativo/inativo. */
  isActive?: boolean;
};

/** Resposta normalizada no frontend após `listEstablishmentServices`. */
export type EstablishmentServicesPage = {
  items: EstablishmentServiceItem[];
  total: number;
  page: number;
  size: number;
};

/** Formas comuns devolvidas pelo backend antes da normalização. */
export type EstablishmentServicesListApiResponse = {
  items?: EstablishmentServiceItem[];
  data?: EstablishmentServiceItem[];
  services?: EstablishmentServiceItem[];
  total?: number;
  totalCount?: number;
};
