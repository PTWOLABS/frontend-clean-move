/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import {
  formatBrlCurrencyFromReais,
  formatBrlFromCents,
  formatReaisToBrlDecimal,
  parseBrlMoneyToReais,
} from "./format-brl-money";

describe("formatBrlFromCents", () => {
  it("formats centavos as BRL currency", () => {
    expect(formatBrlFromCents(3000)).toMatch(/30/);
    expect(formatBrlFromCents(3000)).toMatch(/R\$/);
  });

  it("handles undefined and invalid as zero", () => {
    expect(formatBrlFromCents(undefined)).toBe("R$ 0,00");
    expect(formatBrlFromCents("not-a-number")).toBe("R$ 0,00");
  });
});

describe("formatBrlCurrencyFromReais", () => {
  it("formats reais with currency symbol", () => {
    expect(formatBrlCurrencyFromReais(30)).toMatch(/30/);
    expect(formatBrlCurrencyFromReais(30)).toMatch(/R\$/);
  });
});

describe("parseBrlMoneyToReais", () => {
  it("parses comma as decimal separator", () => {
    expect(parseBrlMoneyToReais("30,00")).toBe(30);
    expect(parseBrlMoneyToReais("30,5")).toBe(30.5);
    expect(parseBrlMoneyToReais("0,01")).toBe(0.01);
  });

  it("parses thousands with dot", () => {
    expect(parseBrlMoneyToReais("1.234,56")).toBe(1234.56);
  });

  it("parses integer without comma", () => {
    expect(parseBrlMoneyToReais("45")).toBe(45);
  });

  it("returns NaN for empty or invalid", () => {
    expect(Number.isNaN(parseBrlMoneyToReais(""))).toBe(true);
    expect(Number.isNaN(parseBrlMoneyToReais("  "))).toBe(true);
    expect(Number.isNaN(parseBrlMoneyToReais("abc"))).toBe(true);
  });
});

describe("formatReaisToBrlDecimal", () => {
  it("formats with two decimal places without R$", () => {
    expect(formatReaisToBrlDecimal(30)).toBe("30,00");
    expect(formatReaisToBrlDecimal(1234.5)).toBe("1.234,50");
  });
});
