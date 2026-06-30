import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseApiDateTimeAsLocalDate } from "@/shared/utils/lib";
import type { QuoteListItemDto } from "../types/quotes";

export function formatShortDate(value: string | null): string {
  if (!value) return "sem data";

  const date = parseApiDateTimeAsLocalDate(value);

  if (Number.isNaN(date.getTime())) {
    return "data inválida";
  }

  return format(date, "dd/MM", {
    locale: ptBR,
  });
}

export function getQuoteVehicleLabel(quote: QuoteListItemDto): string {
  return quote.vehicleLabel?.trim() || "Veiculo não informado";
}

export function getQuoteVehiclePlate(quote: QuoteListItemDto): string {
  return quote.vehiclePlate?.trim() || "Sem placa";
}
