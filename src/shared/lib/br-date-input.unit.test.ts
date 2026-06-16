import { describe, expect, it } from "vitest";

import { formatIsoDateToBr, parseBrDateToIso } from "./br-date-input";

describe("br-date-input", () => {
  it("formatIsoDateToBr converts yyyy-MM-dd to dd/MM/yyyy", () => {
    expect(formatIsoDateToBr("1990-01-15")).toBe("15/01/1990");
  });

  it("parseBrDateToIso converts dd/MM/yyyy to yyyy-MM-dd", () => {
    expect(parseBrDateToIso("15/01/1990")).toBe("1990-01-15");
  });

  it("parseBrDateToIso accepts ISO input", () => {
    expect(parseBrDateToIso("1990-01-15")).toBe("1990-01-15");
  });

  it("parseBrDateToIso rejects invalid calendar dates", () => {
    expect(parseBrDateToIso("31/02/2000")).toBeNull();
  });

  it("parseBrDateToIso rejects partial dates", () => {
    expect(parseBrDateToIso("15/01/19")).toBeNull();
  });
});
