/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { buildEstablishmentVehiclesQueryParams } from "./build-establishment-vehicles-query";

describe("vehicle/lib/build-establishment-vehicles-query", () => {
  it("includes pagination only by default", () => {
    const params = buildEstablishmentVehiclesQueryParams({ page: 2, size: 10 });

    expect(params.toString()).toBe("page=2&size=10");
  });

  it("includes customerId when provided", () => {
    const params = buildEstablishmentVehiclesQueryParams({
      customerId: "customer-1",
      page: 1,
      size: 20,
    });

    expect(params.toString()).toBe("customerId=customer-1&page=1&size=20");
  });

  it("includes name filter independently", () => {
    const params = buildEstablishmentVehiclesQueryParams({
      name: "Maria",
      page: 1,
      size: 20,
    });

    expect(params.toString()).toBe("name=Maria&page=1&size=20");
  });

  it("includes plate filter independently", () => {
    const params = buildEstablishmentVehiclesQueryParams({
      plate: "abc-1d23",
      page: 1,
      size: 10,
    });

    expect(params.toString()).toBe("plate=abc-1d23&page=1&size=10");
  });

  it("combines multiple filters with AND semantics in query string", () => {
    const params = buildEstablishmentVehiclesQueryParams({
      brand: "Volks",
      color: "Branco",
      page: 1,
      size: 20,
    });

    expect(params.toString()).toBe("brand=Volks&color=Branco&page=1&size=20");
  });

  it("treats blank filter values as absent", () => {
    const params = buildEstablishmentVehiclesQueryParams({
      name: "   ",
      plate: "ABC1D23",
      page: 1,
      size: 10,
    });

    expect(params.toString()).toBe("plate=ABC1D23&page=1&size=10");
    expect(params.has("name")).toBe(false);
  });
});
