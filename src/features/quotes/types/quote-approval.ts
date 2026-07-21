import type { AnalyzeQuoteApprovalBody } from "./analyze-quote-approval";

export type ApproveQuoteBody = AnalyzeQuoteApprovalBody & {
  customerResolution?: ApproveQuoteCustomerResolution;
  vehicleResolution?: ApproveQuoteVehicleResolution;
  serviceResolutions?: ApproveQuoteServiceResolution[];
};

export type ApproveQuoteResponseDto = unknown;

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
