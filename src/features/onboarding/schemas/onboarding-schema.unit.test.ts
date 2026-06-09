import { describe, expect, it } from "vitest";

import { onboardingCompanyStepSchema, onboardingServiceStepSchema } from "./onboarding-schema";

describe("onboardingCompanyStepSchema", () => {
  it("allows all company fields to be empty", () => {
    const result = onboardingCompanyStepSchema.safeParse({
      cnpj: "",
      legalName: "",
      tradeName: "",
    });

    expect(result.success).toBe(true);
  });
});

describe("onboardingServiceStepSchema", () => {
  it("allows the service step to be empty", () => {
    const result = onboardingServiceStepSchema.safeParse({
      name: "",
      description: "",
      category: "",
      minDurationInMinutes: "",
      maxDurationInMinutes: "",
      price: "",
      isActive: false,
    });

    expect(result.success).toBe(true);
  });

  it("requires service core fields when any service field is filled", () => {
    const result = onboardingServiceStepSchema.safeParse({
      name: "",
      description: "Lavagem externa simples.",
      category: undefined,
      minDurationInMinutes: "",
      maxDurationInMinutes: "",
      price: "",
      isActive: false,
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["name"] }),
        expect.objectContaining({ path: ["category"] }),
        expect.objectContaining({ path: ["minDurationInMinutes"] }),
        expect.objectContaining({ path: ["price"] }),
      ]),
    );
  });

  it("allows a filled service when required fields are valid", () => {
    const result = onboardingServiceStepSchema.safeParse({
      name: "Lavagem premium",
      description: "",
      category: "WASH",
      minDurationInMinutes: "30",
      maxDurationInMinutes: "",
      price: "120,00",
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects max duration smaller than min duration", () => {
    const result = onboardingServiceStepSchema.safeParse({
      name: "Lavagem premium",
      description: "",
      category: "WASH",
      minDurationInMinutes: "60",
      maxDurationInMinutes: "30",
      price: "120,00",
      isActive: true,
    });

    expect(result.success).toBe(false);

    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ["maxDurationInMinutes"] })]),
    );
  });
});
