const LOCALE = "pt-BR";
const CURRENCY = "BRL";

const currencyFromCentsFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

const currencyFromReaisFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

const reaisDecimalFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formata valor em **centavos** (inteiro) para moeda BRL com símbolo (ex.: `3000` → `R$ 30,00`).
 * Valores inválidos ou ausentes resultam em `R$ 0,00`.
 */
export function formatBrlFromCents(amount: unknown): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  const cents = Number.isFinite(n) ? n : 0;
  return currencyFromCentsFormatter.format(cents / 100);
}

/**
 * Formata **reais** (número) para moeda BRL com símbolo (ex.: `30.5` → `R$ 30,50`).
 */
export function formatBrlCurrencyFromReais(reais: number): string {
  if (!Number.isFinite(reais)) return currencyFromReaisFormatter.format(0);
  return currencyFromReaisFormatter.format(reais);
}

/**
 * Formata **reais** para texto pt-BR **sem** prefixo `R$` (ex.: entradas de formulário — `30` → `30,00`).
 */
export function formatReaisToBrlDecimal(reais: number): string {
  if (!Number.isFinite(reais)) return "";
  return reaisDecimalFormatter.format(reais);
}

/** Alias explícito para campos de texto monetário. */
export const formatReaisToBrlInput = formatReaisToBrlDecimal;

/**
 * Converte texto em formato monetário brasileiro (ex.: `1.234,56` ou `30`) para valor em **reais**.
 * Vírgula = separador decimal; ponto = milhares (opcional).
 */
export function parseBrlMoneyToReais(value: string): number {
  const t = value.trim();
  if (!t) return Number.NaN;

  const commaIdx = t.lastIndexOf(",");
  let intPart: string;
  let fracPart: string;

  if (commaIdx === -1) {
    intPart = t.replace(/\./g, "").replace(/\s/g, "");
    fracPart = "";
  } else {
    intPart = t.slice(0, commaIdx).replace(/\./g, "").replace(/\s/g, "");
    fracPart = t.slice(commaIdx + 1).replace(/\D/g, "");
  }

  const normalized = fracPart.length > 0 ? `${intPart}.${fracPart}` : intPart;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : Number.NaN;
}
