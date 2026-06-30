import { describe, expect, it, vi } from "vitest";

import {
  buildQueryParamsFilters,
  formatNumericInputValue,
  getOnlyNumbers,
  handleNumericInputChange,
  normalizeQueryParamsFilters,
  parseApiDateTimeAsLocalDate,
} from "./lib";

describe("query params filters", () => {
  it("formats array values as repeated query params", () => {
    const normalizedFilters = normalizeQueryParamsFilters({
      page: 1,
      size: 20,
      status: ["DONE", "SCHEDULED"],
    });

    expect(normalizedFilters).toEqual({
      page: "1",
      size: "20",
      status: ["DONE", "SCHEDULED"],
    });
    expect(buildQueryParamsFilters(normalizedFilters)).toBe(
      "?page=1&size=20&status=DONE&status=SCHEDULED",
    );
  });

  it("serializes dates as UTC ISO strings", () => {
    const normalizedFilters = normalizeQueryParamsFilters({
      startsAt: new Date(2026, 3, 1),
      endsAt: new Date(2026, 3, 7),
    });

    expect(normalizedFilters).toEqual({
      startsAt: "2026-04-01T00:00:00.000Z",
      endsAt: "2026-04-07T00:00:00.000Z",
    });
    expect(buildQueryParamsFilters(normalizedFilters)).toBe(
      "?startsAt=2026-04-01T00%3A00%3A00.000Z&endsAt=2026-04-07T00%3A00%3A00.000Z",
    );
  });
});

describe("numeric input helpers", () => {
  it("keeps only numeric characters", () => {
    expect(getOnlyNumbers("A1.2-3,4")).toBe("1234");
  });

  it("formats numeric input as BRL currency from cents", () => {
    expect(formatNumericInputValue("1234", { formatAsCurrency: true }).replace(/\s/g, " ")).toBe(
      "R$ 12,34",
    );
  });

  it("can format currency without the BRL symbol", () => {
    expect(
      formatNumericInputValue("R$ 1a2b3c4", {
        formatAsCurrency: true,
        showCurrencySymbol: false,
      }),
    ).toBe("12,34");
  });

  it("applies the formatted value in an onChange handler", () => {
    const onChange = vi.fn();

    handleNumericInputChange({ target: { value: "abc500" } }, onChange, {
      formatAsCurrency: true,
      showCurrencySymbol: false,
    });

    expect(onChange).toHaveBeenCalledWith("5,00");
  });
});

describe("parseApiDateTimeAsLocalDate", () => {
  it("preserves API date and time parts from UTC-shaped strings", () => {
    const date = parseApiDateTimeAsLocalDate("2026-07-01T00:00:00.000Z");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });
});
