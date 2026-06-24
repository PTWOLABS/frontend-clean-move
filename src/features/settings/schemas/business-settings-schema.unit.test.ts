import { describe, expect, it } from "vitest";

import { businessSettingsSchema, mapBusinessFormToPatchPayload } from "./business-settings-schema";

describe("businessSettingsSchema", () => {
  it("should accept all fields empty", () => {
    const result = businessSettingsSchema.safeParse({
      tradeName: "",
      legalBusinessName: "",
      cnpj: "",
    });

    expect(result.success).toBe(true);
  });

  it("should accept only tradeName filled", () => {
    const result = businessSettingsSchema.safeParse({
      tradeName: "CleanMove Auto Center",
      legalBusinessName: "",
      cnpj: "",
    });

    expect(result.success).toBe(true);
  });

  it("should accept empty cnpj", () => {
    const result = businessSettingsSchema.safeParse({
      tradeName: "",
      legalBusinessName: "",
      cnpj: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects incomplete cnpj when filled", () => {
    const result = businessSettingsSchema.safeParse({
      tradeName: "",
      legalBusinessName: "",
      cnpj: "12.345.678/0001-9",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "cnpj")?.message;
      expect(message).toBe("CNPJ incompleto");
    }
  });

  it("should accept valid cnpj when filled", () => {
    const result = businessSettingsSchema.safeParse({
      tradeName: "",
      legalBusinessName: "",
      cnpj: "12.345.678/0001-95",
    });

    expect(result.success).toBe(true);
  });

  it("should reject cnpj with invalid check digits", () => {
    const result = businessSettingsSchema.safeParse({
      tradeName: "",
      legalBusinessName: "",
      cnpj: "12.345.678/0001-90",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "cnpj")?.message;
      expect(message).toBe("CNPJ inválido");
    }
  });
});

describe("mapBusinessFormToPatchPayload", () => {
  it("should not include slug in the payload", () => {
    const payload = mapBusinessFormToPatchPayload({
      tradeName: "CleanMove",
      legalBusinessName: "CleanMove LTDA",
      cnpj: "12.345.678/0001-95",
    });

    expect(payload).toEqual({
      tradeName: "CleanMove",
      legalBusinessName: "CleanMove LTDA",
      cnpj: "12345678000195",
    });
    expect(payload).not.toHaveProperty("slug");
  });
});
