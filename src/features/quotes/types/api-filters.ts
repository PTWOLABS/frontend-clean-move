import { PaginationParams } from "@/shared/types/pagination";

export type QuotesApiFilters = PaginationParams & {
  createdAt?: string;
  sort?: "recent" | "oldest";
  converted?: boolean;
  expiresTo?: string;
  expiresFrom?: string;
  serviceName?: string;
  serviceId?: string;
  vehiclePlate?: string;
  vehicleId?: string;
  customerName?: string;
  customerId?: string;
};
