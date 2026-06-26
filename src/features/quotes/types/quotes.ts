type QuoteListItemDto = {
  id: string;
  code?: string;
  customerName: string;
  customerKind: "CUSTOMER" | "PROSPECT";
  vehicleLabel: string | null;
  vehiclePlate: string | null;
  totalInCents: number;
  status: "VALID" | "EXPIRES_TODAY" | "EXPIRED" | "APPROVED";
  expiresAt: string | null;
  createdAt: string;
  servicesCount?: number;
};

export type ListQuotesResponseDto = {
  quotes: QuoteListItemDto[];
  totalItems: number;
  summary: {
    valid: number;
    expiresToday: number;
    approved: number;
    expired: number;
  };
};
