import type { ResourceStatus } from "@/features/appointments/types/appointments-dto";
import type { ServiceCategoryRef } from "@/features/service-category/types";
import type { ApiValidationError } from "@/shared/lib/resolve-api-error-feedback";
import type { AppointmentStatus } from "@/shared/types/appointments";

import type { AnalyzeQuoteApprovalBody, QuoteApprovalAnalysisDto } from "./analyze-quote-approval";

export type ApproveQuoteBody = AnalyzeQuoteApprovalBody & {
  customerResolution?: ApproveQuoteCustomerResolution;
  vehicleResolution?: ApproveQuoteVehicleResolution;
  serviceResolutions?: ApproveQuoteServiceResolution[];
};

export type ApproveQuoteResponseDto = {
  appointment: ApproveQuoteAppointmentDto;
  quote: ApproveQuoteConvertedQuoteDto;
};

export type ApproveQuoteAppointmentDto = {
  id: string;
  establishmentId: string;
  customerId: string;
  customer: {
    fullName: string;
    currentResourceStatus: ResourceStatus;
  };
  vehicleId: string | null;
  services: ApproveQuoteAppointmentServiceDto[];
  vehicle: ApproveQuoteAppointmentVehicleDto | null;
  startsAt: string;
  endsAt: string | null;
  description: string | null;
  discountInCents: number | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  doneAt: string | null;
  cancelledAt: string | null;
};

export type ApproveQuoteAppointmentServiceDto = {
  id: string;
  name: string;
  category: ServiceCategoryRef | null;
  durationInMinutes: number | null;
  priceInCents: number;
  currentResourceStatus: ResourceStatus;
};

export type ApproveQuoteAppointmentVehicleDto = {
  plate: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  displayName: string;
  currentResourceStatus: ResourceStatus;
};

export type ApproveQuoteConvertedQuoteDto = {
  id: string;
  establishmentId: string;
  customerId: string | null;
  vehicleId: string | null;
  convertedAppointmentId: string | null;
  convertedAt: string;
  establishment: ApproveQuoteEstablishmentSnapshotDto;
  customer: ApproveQuoteCustomerSnapshotDto;
  vehicle: ApproveQuoteVehicleSnapshotDto | null;
  services: ApproveQuoteServiceSnapshotDto[];
  paymentOptions: ApproveQuotePaymentOptionDto[];
  subtotalInCents: number;
  totalCourtesyValueInCents: number;
  description: string | null;
  termsAndConditions: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApproveQuoteEstablishmentSnapshotDto = {
  name: string;
  legalBusinessName: string | null;
  cnpj: string | null;
  address: string | null;
  bannerImageUrl: string | null;
};

export type ApproveQuoteCustomerSnapshotDto = {
  name: string;
  phone: string | null;
  cpfCnpj: string | null;
  address: string | null;
};

export type ApproveQuoteVehicleSnapshotDto = {
  plate: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
};

export type ApproveQuoteServiceSnapshotDto = {
  id: string;
  name: string;
  category: ServiceCategoryRef | null;
  durationInMinutes: number | null;
  priceInCents: number;
  isCourtesy: boolean;
};

export type ApproveQuotePaymentMethod = "CASH" | "PIX" | "CARD" | "OTHER";

export type ApproveQuotePaymentDiscountType = "PERCENTAGE" | "AMOUNT";

export type ApproveQuotePaymentOptionDto = {
  method: ApproveQuotePaymentMethod;
  label: string;
  installments: number | null;
  interestFree: boolean | null;
  discountType: ApproveQuotePaymentDiscountType | null;
  discountValue: number | null;
  totalInCents: number;
};

export type ApproveQuoteErrorCode =
  | "VALIDATION_ERROR"
  | "QUOTE_INVALID_SCHEDULE_INTERVAL"
  | "QUOTE_ALREADY_CONVERTED"
  | "QUOTE_INVALID_RESOLUTION_ACTION"
  | "QUOTE_SERVICE_NAME_UNAVAILABLE"
  | "QUOTE_DUPLICATE_SERVICE_RESOLUTION"
  | "QUOTE_SERVICE_ITEM_NOT_FOUND"
  | "QUOTE_CANNOT_BE_APPROVED_FOR_PROSPECT"
  | "QUOTE_VEHICLE_SNAPSHOT_MISSING"
  | "QUOTE_VEHICLE_SNAPSHOT_INCOMPLETE"
  | "QUOTE_CUSTOMER_ADDRESS_INCOMPLETE"
  | "INVALID_QUOTE_INPUT"
  | "QUOTE_APPROVAL_RESOLUTION_REQUIRED"
  | "QUOTE_APPROVAL_CONFLICTS_CHANGED"
  | "FORBIDDEN"
  | "QUOTE_NOT_FOUND"
  | "ESTABLISHMENT_NOT_FOUND"
  | "CUSTOMER_NOT_FOUND"
  | "VEHICLE_NOT_FOUND"
  | "SERVICE_NOT_FOUND"
  | "RESOURCE_NOT_FOUND"
  | "INTERNAL_ERROR";

export type ApproveQuoteQuoteErrorResponseDto = {
  statusCode: number;
  code: ApproveQuoteErrorCode;
  message: string;
  errors?: ApiValidationError[];
  analysis?: QuoteApprovalAnalysisDto;
};

export type ApproveQuoteNestErrorResponseDto = {
  statusCode: 401 | 403;
  message: string;
  error: "Unauthorized" | "Forbidden" | string;
};

export type ApproveQuoteErrorResponseDto =
  | ApproveQuoteQuoteErrorResponseDto
  | ApproveQuoteNestErrorResponseDto;

export type ApproveQuoteCustomerResolution =
  | ApproveQuoteLinkExistingCustomerResolution
  | ApproveQuoteCreateCustomerResolution;

export type ApproveQuoteLinkExistingCustomerResolution = {
  action: "LINK_EXISTING";
  customerId: string;
  email?: never;
  phone?: never;
};

export type ApproveQuoteCreateCustomerResolution = {
  action: "CREATE_NEW";
  customerId?: never;
  email?: string | null;
  phone?: string | null;
};

export type ApproveQuoteVehicleResolution =
  | ApproveQuoteLinkExistingVehicleResolution
  | ApproveQuoteCreateVehicleFromSnapshotResolution
  | ApproveQuoteKeepVehicleSnapshotOnlyResolution;

export type ApproveQuoteVehicleResolutionAction = ApproveQuoteVehicleResolution["action"];

export type ApproveQuoteLinkExistingVehicleResolution = {
  action: "LINK_EXISTING";
  vehicleId: string;
};

export type ApproveQuoteCreateVehicleFromSnapshotResolution = {
  action: "CREATE_FROM_SNAPSHOT";
  vehicleId?: never;
};

export type ApproveQuoteKeepVehicleSnapshotOnlyResolution = {
  action: "KEEP_SNAPSHOT_ONLY";
  vehicleId?: never;
};

export type ApproveQuoteServiceResolution =
  | ApproveQuoteAssociateExistingServiceResolution
  | ApproveQuoteKeepInactiveServiceLinkResolution
  | ApproveQuoteRenameDetachedServiceResolution
  | ApproveQuoteRecreateServiceFromSnapshotResolution;

export type ApproveQuoteServiceResolutionAction = ApproveQuoteServiceResolution["action"];

export type ApproveQuoteAssociateExistingServiceResolution = {
  quoteServiceId: string;
  action: "ASSOCIATE_EXISTING";
  serviceId: string;
  serviceName?: never;
};

export type ApproveQuoteKeepInactiveServiceLinkResolution = {
  quoteServiceId: string;
  action: "KEEP_INACTIVE_LINK";
  serviceId?: never;
  serviceName?: never;
};

export type ApproveQuoteRenameDetachedServiceResolution = {
  quoteServiceId: string;
  action: "RENAME_DETACHED";
  serviceName: string;
  serviceId?: never;
};

export type ApproveQuoteRecreateServiceFromSnapshotResolution = {
  quoteServiceId: string;
  action: "RECREATE_FROM_SNAPSHOT";
  serviceId?: never;
  serviceName?: never;
};
