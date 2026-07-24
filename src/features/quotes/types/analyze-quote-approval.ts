export type AnalyzeQuoteApprovalBody = {
  startsAt: string;
  endsAt?: string | null;
};

export type AnalyzeQuoteApprovalResponseDto = {
  analysis: QuoteApprovalAnalysisDto;
};

export type QuoteApprovalAnalysisDto = {
  status: QuoteApprovalAnalysisStatus;
  automaticResolutions: QuoteAutomaticResolutionDto[];
  customer: QuoteCustomerAnalysisDto;
  vehicle: QuoteVehicleAnalysisDto;
  services: QuoteServiceAnalysisDto[];
};

export type QuoteApprovalAnalysisStatus = "READY" | "REQUIRES_RESOLUTION";

export type QuoteAutomaticResolutionDto = {
  resource: "CUSTOMER";
  action: "LINK_EXISTING";
  resourceId: string;
  matchedBy: "CPF_CNPJ";
};

export type QuoteCustomerAnalysisDto = {
  status: QuoteCustomerAnalysisStatus;
  requiresResolution: boolean;
  automaticCustomerId: string | null;
  candidates: QuoteCustomerCandidateDto[];
};

export type QuoteCustomerAnalysisStatus =
  | "RESOLVED"
  | "AUTO_LINK"
  | "CANDIDATES_FOUND"
  | "CREATE_REQUIRED"
  | "LINKED_RESOURCE_DELETED";

export type QuoteCustomerCandidateDto = {
  customerId: string;
  name: string;
  phone: string | null;
  email: string | null;
  cpfCnpj: string | null;
  matchedBy: QuoteCustomerMatchedBy[];
  conflictingFields: QuoteCustomerConflictingField[];
  advisoryOnly: boolean;
};

export type QuoteCustomerMatchedBy = "CPF_CNPJ" | "PHONE" | "EMAIL" | "NAME";

export type QuoteCustomerConflictingField = "NAME" | "PHONE" | "EMAIL";

export type QuoteVehicleAnalysisDto = {
  status: QuoteVehicleAnalysisStatus;
  requiresResolution: boolean;
  candidateVehicleId: string | null;
  candidateCustomerId: string | null;
  allowedActions: QuoteVehicleResolutionAction[];
};

export type QuoteVehicleAnalysisStatus =
  | "NONE"
  | "RESOLVED"
  | "CANDIDATE_FOUND"
  | "SNAPSHOT_ONLY"
  | "OWNERSHIP_CONFLICT"
  | "LINKED_RESOURCE_DELETED";

export type QuoteVehicleResolutionAction =
  | "LINK_EXISTING"
  | "CREATE_FROM_SNAPSHOT"
  | "KEEP_SNAPSHOT_ONLY"
  | "EDIT_SNAPSHOT_PLATE";

export type QuoteServiceAnalysisDto = {
  quoteServiceId: string;
  status: QuoteServiceAnalysisStatus;
  requiresResolution: boolean;
  serviceId: string | null;
  candidateServiceId: string | null;
  snapshot: QuoteServiceSnapshotAnalysisDto;
  candidate: QuoteServiceCandidateAnalysisDto | null;
  differences: QuoteServiceDifference[];
  allowedActions: QuoteServiceResolutionAction[];
};

export type QuoteServiceAnalysisStatus =
  | "RESOLVED"
  | "READY_TO_CREATE"
  | "CANDIDATE_FOUND"
  | "LINKED_SERVICE_INACTIVE"
  | "LINKED_SERVICE_DELETED"
  | "LINKED_SERVICE_MISSING";

export type QuoteServiceDifference =
  | "NAME"
  | "CATEGORY"
  | "DURATION"
  | "PRICE_SPECIFICATION"
  | "PRICE";

export type QuoteServiceResolutionAction =
  | "ASSOCIATE_EXISTING"
  | "KEEP_INACTIVE_LINK"
  | "RENAME_DETACHED"
  | "RECREATE_FROM_SNAPSHOT";

export type QuoteServiceSnapshotAnalysisDto = {
  name: string;
  priceInCents: number;
  durationInMinutes: number | null;
  categoryId: string | null;
  categoryName: string | null;
  isCourtesy: boolean;
};

export type QuoteServiceCandidateAnalysisDto = {
  serviceId: string;
  name: string;
  isActive: boolean;
  priceSpecification: ServicePriceSpecificationDto;
  durationInMinutes: number | null;
  categoryId: string | null;
  categoryName: string | null;
};

export type ServicePriceSpecificationDto =
  | FixedServicePriceSpecificationDto
  | StartingAtServicePriceSpecificationDto
  | RangeServicePriceSpecificationDto;

export type FixedServicePriceSpecificationDto = {
  type: "FIXED";
  fixedPriceInCents: number;
  minPriceInCents?: never;
  maxPriceInCents?: never;
};

export type StartingAtServicePriceSpecificationDto = {
  type: "STARTING_AT";
  fixedPriceInCents?: never;
  minPriceInCents: number;
  maxPriceInCents?: never;
};

export type RangeServicePriceSpecificationDto = {
  type: "RANGE";
  fixedPriceInCents?: never;
  minPriceInCents: number;
  maxPriceInCents: number;
};
