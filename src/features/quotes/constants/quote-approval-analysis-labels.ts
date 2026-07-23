import type {
  QuoteCustomerAnalysisStatus,
  QuoteCustomerConflictingField,
  QuoteCustomerMatchedBy,
  QuoteServiceAnalysisStatus,
  QuoteServiceDifference,
  QuoteServiceResolutionAction,
  QuoteVehicleAnalysisStatus,
  QuoteVehicleResolutionAction,
} from "../types/analyze-quote-approval";

export const QUOTE_CUSTOMER_ANALYSIS_STATUS_LABELS = {
  RESOLVED: "Cliente resolvido",
  AUTO_LINK: "Cliente vinculado automaticamente",
  CANDIDATES_FOUND: "Cliente com correspondências",
  CREATE_REQUIRED: "Cliente precisa ser cadastrado",
  LINKED_RESOURCE_DELETED: "Cliente vinculado indisponível",
} satisfies Record<QuoteCustomerAnalysisStatus, string>;

export const QUOTE_CUSTOMER_MATCHED_BY_LABELS = {
  CPF_CNPJ: "CPF/CNPJ",
  PHONE: "telefone",
  EMAIL: "e-mail",
  NAME: "nome",
} satisfies Record<QuoteCustomerMatchedBy, string>;

export const QUOTE_CUSTOMER_DIVERGENT_FIELD_LABELS = {
  NAME: "nome",
  PHONE: "telefone",
  EMAIL: "e-mail",
} satisfies Record<QuoteCustomerConflictingField, string>;

export const QUOTE_VEHICLE_ANALYSIS_STATUS_LABELS = {
  NONE: "Sem veículo no orçamento",
  RESOLVED: "Veículo resolvido",
  CANDIDATE_FOUND: "Veículo com correspondência",
  SNAPSHOT_ONLY: "Veículo precisa ser definido",
  OWNERSHIP_CONFLICT: "Veículo pertence a outro cliente",
  LINKED_RESOURCE_DELETED: "Veículo vinculado indisponível",
} satisfies Record<QuoteVehicleAnalysisStatus, string>;

export const QUOTE_VEHICLE_RESOLUTION_ACTION_LABELS = {
  LINK_EXISTING: "vincular veículo existente",
  CREATE_FROM_SNAPSHOT: "criar veículo pelos dados do orçamento",
  KEEP_SNAPSHOT_ONLY: "manter apenas os dados do orçamento",
  EDIT_SNAPSHOT_PLATE: "editar a placa antes de continuar",
} satisfies Record<QuoteVehicleResolutionAction, string>;

export const QUOTE_SERVICE_ANALYSIS_STATUS_LABELS = {
  RESOLVED: "Serviço resolvido",
  READY_TO_CREATE: "Serviço pronto para cadastro",
  CANDIDATE_FOUND: "Serviço com correspondência",
  LINKED_SERVICE_INACTIVE: "Serviço vinculado inativo",
  LINKED_SERVICE_DELETED: "Serviço vinculado indisponível",
  LINKED_SERVICE_MISSING: "Serviço vinculado não encontrado",
} satisfies Record<QuoteServiceAnalysisStatus, string>;

export const QUOTE_SERVICE_DIFFERENCE_LABELS = {
  NAME: "nome",
  CATEGORY: "categoria",
  DURATION: "duração",
  PRICE_SPECIFICATION: "tipo de preço",
  PRICE: "preço",
} satisfies Record<QuoteServiceDifference, string>;

export const QUOTE_SERVICE_RESOLUTION_ACTION_LABELS = {
  ASSOCIATE_EXISTING: "associar serviço existente",
  KEEP_INACTIVE_LINK: "manter vínculo inativo",
  RENAME_DETACHED: "renomear serviço avulso",
  RECREATE_FROM_SNAPSHOT: "recriar serviço pelos dados do orçamento",
} satisfies Record<QuoteServiceResolutionAction, string>;
