/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import { buildEstablishmentVehiclesFiltersFromSearch } from "./build-establishment-vehicles-filters-from-search";

describe("vehicle/lib/build-establishment-vehicles-filters-from-search", () => {
  it("maps search type to the dedicated query param", () => {
    expect(
      buildEstablishmentVehiclesFiltersFromSearch("name", "Maria", { page: 1, size: 6 }),
    ).toEqual({ page: 1, size: 6, name: "Maria" });
  });

  it("omits filter param when term is blank", () => {
    expect(
      buildEstablishmentVehiclesFiltersFromSearch("plate", "  ", { page: 2, size: 6 }),
    ).toEqual({ page: 2, size: 6 });
  });
});
