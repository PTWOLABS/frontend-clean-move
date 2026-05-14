"use client";

import { useMemo } from "react";

import {
  formatBrlCurrencyFromReais,
  formatBrlFromCents,
  formatReaisToBrlDecimal,
  formatReaisToBrlInput,
  parseBrlMoneyToReais,
} from "./format-brl-money";

/**
 * API estável para formatar / interpretar valores em BRL no cliente.
 * Útil quando vários componentes precisam das mesmas funções (evita imports repetidos).
 */
export function useFormatBrlMoney() {
  return useMemo(
    () => ({
      /** Centavos inteiros → `R$ 30,00` */
      formatFromCents: formatBrlFromCents,
      /** Reais → `R$ 30,00` */
      formatCurrencyFromReais: formatBrlCurrencyFromReais,
      /** Reais → `30,00` (sem símbolo; inputs) */
      formatReaisToDecimal: formatReaisToBrlDecimal,
      /** Alias de {@link formatReaisToBrlDecimal} */
      formatReaisToInput: formatReaisToBrlInput,
      /** Texto pt-BR → número em reais */
      parseToReais: parseBrlMoneyToReais,
    }),
    [],
  );
}
