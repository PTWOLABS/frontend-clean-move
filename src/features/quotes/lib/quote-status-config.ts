import type { QuoteStatus } from "../types/quotes";

export type QuoteStatusTone = "info" | "success" | "warning" | "danger";

export const quoteStatusConfig: Record<
  QuoteStatus,
  {
    label: string;
    tone: QuoteStatusTone;
    footerLabel: string;
  }
> = {
  APPROVED: {
    label: "Aprovado",
    tone: "success",
    footerLabel: "Aprovado em",
  },
  VALID: {
    label: "Válido",
    tone: "info",
    footerLabel: "Expira em",
  },
  EXPIRES_TODAY: {
    label: "Vence hoje",
    tone: "warning",
    footerLabel: "Expira hoje",
  },
  EXPIRED: {
    label: "Vencido",
    tone: "danger",
    footerLabel: "Expirado em",
  },
};
