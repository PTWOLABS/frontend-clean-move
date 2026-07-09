import { formatShortDateBR } from "@/shared/lib/date-time";

import type { QuoteListItemDto } from "../types/quotes";

export function formatShortDate(value: string | null): string {
  if (!value) return "sem data";

  return formatShortDateBR(value) || "data inválida";
}

export function getQuoteVehicleLabel(quote: QuoteListItemDto): string {
  return quote.vehicleLabel?.trim() || "Veículo não informado";
}

export function getQuoteVehiclePlate(quote: QuoteListItemDto): string {
  return quote.vehiclePlate?.trim() || "Sem placa";
}
