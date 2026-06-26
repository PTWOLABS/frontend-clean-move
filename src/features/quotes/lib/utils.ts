import type { QuoteListItemDto } from "../types/quotes";

export function formatShortDate(value: string | null): string {
  if (!value) return "sem data";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "data invalida";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function getQuoteVehicleLabel(quote: QuoteListItemDto): string {
  return quote.vehicleLabel?.trim() || "Veiculo nao informado";
}

export function getQuoteVehiclePlate(quote: QuoteListItemDto): string {
  return quote.vehiclePlate?.trim() || "Sem placa";
}
