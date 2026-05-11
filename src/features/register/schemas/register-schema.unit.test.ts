/** @vitest-environment node */

import { describe, expect, it } from "vitest";

import {
  accountStepSchema,
  addressStepSchema,
  companyStepSchema,
  registerDefaultValues,
  registerSchema,
} from "./register-schema";

const validAccount = {
  fullName: "João da Silva",
  phone: "(11) 99999-1234",
  email: "joao@email.com",
  password: "supersenha",
};

const validCompany = {
  cnpj: "12.345.678/0001-90",
  legalName: "Empresa LTDA",
  tradeName: "Empresa",
};

const validAddress = {
  zipCode: "01310-100",
  street: "Av. Paulista",
  number: "1000",
  city: "São Paulo",
  state: "SP",
  complement: "Sala 1",
};

describe("accountStepSchema", () => {
  it("should accept a valid payload", () => {
    const result = accountStepSchema.safeParse(validAccount);
    expect(result.success).toBe(true);
  });

  it("should require a fullname with at least 3 characters", () => {
    const result = accountStepSchema.safeParse({ ...validAccount, fullName: "Jo" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "fullName")?.message;
      expect(message).toBe("Informe seu nome completo.");
    }
  });

  it("should reject phone numbers with less than 10 digits", () => {
    const result = accountStepSchema.safeParse({ ...validAccount, phone: "(11) 9999" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "phone")?.message;
      expect(message).toBe("Informe um telefone válido.");
    }
  });

  it("should reject an invalid email", () => {
    const result = accountStepSchema.safeParse({ ...validAccount, email: "nao-eh-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "email")?.message;
      expect(message).toBe("Informe um e-mail válido.");
    }
  });

  it("should reject short passwords", () => {
    const result = accountStepSchema.safeParse({ ...validAccount, password: "1234" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "password")?.message;
      expect(message).toBe("A senha deve ter pelo menos 8 caracteres.");
    }
  });
});

describe("companyStepSchema", () => {
  it("should accept a formatted cnpj with 14 digits", () => {
    const result = companyStepSchema.safeParse(validCompany);
    expect(result.success).toBe(true);
  });

  it("should reject a cnpj with the wrong number of digits", () => {
    const result = companyStepSchema.safeParse({ ...validCompany, cnpj: "12.345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "cnpj")?.message;
      expect(message).toBe("Informe um CNPJ válido.");
    }
  });

  it("should require legalname and tradename", () => {
    const result = companyStepSchema.safeParse({
      ...validCompany,
      legalName: "",
      tradeName: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toEqual(expect.arrayContaining(["legalName", "tradeName"]));
    }
  });
});

describe("addressStepSchema", () => {
  it("should accept a valid address", () => {
    const result = addressStepSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it("should normalize the state to uppercase", () => {
    const result = addressStepSchema.safeParse({ ...validAddress, state: "sp" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.state).toBe("SP");
    }
  });

  it("should reject an invalid zipcode", () => {
    const result = addressStepSchema.safeParse({ ...validAddress, zipCode: "1234" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "zipCode")?.message;
      expect(message).toBe("Informe um CEP válido.");
    }
  });

  it("should reject an unknown state", () => {
    const result = addressStepSchema.safeParse({ ...validAddress, state: "ZZ" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find((issue) => issue.path[0] === "state")?.message;
      expect(message).toBe("Informe uma UF válida.");
    }
  });
});

describe("registerSchema", () => {
  it("should accept the full valid payload", () => {
    const result = registerSchema.safeParse({
      ...validAccount,
      ...validCompany,
      ...validAddress,
    });
    expect(result.success).toBe(true);
  });

  it("should expose default values with all expected keys", () => {
    expect(Object.keys(registerDefaultValues).sort()).toEqual(
      [
        "fullName",
        "phone",
        "email",
        "password",
        "cnpj",
        "legalName",
        "tradeName",
        "zipCode",
        "street",
        "number",
        "city",
        "state",
        "complement",
      ].sort(),
    );
  });
});
