export type QuoteCustomerKind = "CUSTOMER" | "PROSPECT";

export type QuoteStatus = "VALID" | "EXPIRES_TODAY" | "EXPIRED" | "APPROVED";

export type QuoteListItemDto = {
  id: string;
  code?: string;
  customerName: string;
  customerKind: QuoteCustomerKind;
  vehicleLabel: string | null;
  vehiclePlate: string | null;
  totalInCents: number;
  status: QuoteStatus;
  expiresAt: string | null;
  createdAt: string;
  servicesCount?: number;
};

export type QuoteSummary = {
  valid: number;
  expiresToday: number;
  approved: number;
  expired: number;
};

export type ListQuotesResponseDto = {
  quotes: QuoteListItemDto[];
  totalItems: number;
  summary: QuoteSummary;
};
