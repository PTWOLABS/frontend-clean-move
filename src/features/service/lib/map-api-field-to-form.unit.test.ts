/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import {
  mapServiceApiFieldErrorsToForm,
  mapServiceApiPathToFormField,
} from "./map-api-field-to-form";

describe("map-api-field-to-form", () => {
  it("maps known API paths to form fields", () => {
    expect(mapServiceApiPathToFormField("serviceName")).toBe("serviceName");
    expect(mapServiceApiPathToFormField("estimatedDuration.minInMinutes")).toBe("minInMinutes");
    expect(mapServiceApiPathToFormField("priceSpecification.fixedPriceInCents")).toBe(
      "fixedPriceInReais",
    );
  });

  it("maps API field errors to form field errors", () => {
    const mapped = mapServiceApiFieldErrorsToForm({
      serviceName: "Nome obrigatório",
      "priceSpecification.minPriceInCents": "Preço inválido",
      unknownField: "Erro",
    });

    expect(mapped).toEqual({
      serviceName: "Nome obrigatório",
      minPriceInReais: "Preço inválido",
    });
  });
});
