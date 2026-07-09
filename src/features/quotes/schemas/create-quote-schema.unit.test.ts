import { describe, expect, it } from "vitest";

import {
  createQuoteFormSchema,
  quoteCustomerVehicleStepSchema,
  quotePaymentStepSchema,
  quoteServicesStepSchema,
} from "./create-quote-schema";

const serviceId = "00000000-0000-4000-8000-000000000001";

describe("quoteCustomerVehicleStepSchema", () => {
  it("accepts formatted customer contact fields and a four-digit vehicle year", () => {
    const result = quoteCustomerVehicleStepSchema.safeParse(
      makeCustomerVehicleStepInput({
        customer: {
          name: "Cliente teste",
          cpfCnpj: "529.982.247-25",
          phone: "(11) 99999-1234",
          email: "cliente@email.com",
        },
        vehicle: {
          plate: null,
          brand: "Honda",
          model: "Civic",
          color: null,
          year: "2024",
        },
      }),
    );

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected customer and vehicle validation to pass.");
    }

    expect(result.data.vehicle.year).toBe(2024);
  });

  it("rejects an invalid CPF or CNPJ", () => {
    const result = quoteCustomerVehicleStepSchema.safeParse(
      makeCustomerVehicleStepInput({
        customer: {
          name: "Cliente teste",
          cpfCnpj: "111.111.111-11",
          phone: null,
          email: null,
        },
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected customer document validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "CPF inválido.",
          path: ["customer", "cpfCnpj"],
        }),
      ]),
    );
  });

  it("rejects incomplete phone numbers", () => {
    const result = quoteCustomerVehicleStepSchema.safeParse(
      makeCustomerVehicleStepInput({
        customer: {
          name: "Cliente teste",
          cpfCnpj: null,
          phone: "1",
          email: null,
        },
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected phone validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Informe um telefone válido com 10 ou 11 dígitos.",
          path: ["customer", "phone"],
        }),
      ]),
    );
  });

  it("rejects invalid email values", () => {
    const result = quoteCustomerVehicleStepSchema.safeParse(
      makeCustomerVehicleStepInput({
        customer: {
          name: "Cliente teste",
          cpfCnpj: null,
          phone: null,
          email: "cliente@",
        },
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected email validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Informe um e-mail válido.",
          path: ["customer", "email"],
        }),
      ]),
    );
  });

  it("rejects vehicle years with non-digits or more than four digits", () => {
    const nonDigitResult = quoteCustomerVehicleStepSchema.safeParse(
      makeCustomerVehicleStepInput({
        vehicle: {
          plate: null,
          brand: "Honda",
          model: "Civic",
          color: null,
          year: "20e4",
        },
      }),
    );
    const longYearResult = quoteCustomerVehicleStepSchema.safeParse(
      makeCustomerVehicleStepInput({
        vehicle: {
          plate: null,
          brand: "Honda",
          model: "Civic",
          color: null,
          year: "20244",
        },
      }),
    );

    expect(nonDigitResult.success).toBe(false);
    expect(longYearResult.success).toBe(false);
  });
});

describe("quoteServicesStepSchema", () => {
  it("accepts an existing fixed-price service", () => {
    const result = quoteServicesStepSchema.safeParse({
      services: [
        {
          serviceId,
          serviceLabel: "Lavagem completa",
          priceInCents: 9000,
          priceType: "FIXED",
          minPriceInCents: 9000,
          isCourtesy: false,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a starting-at service price below the minimum", () => {
    const result = quoteServicesStepSchema.safeParse({
      services: [
        {
          serviceId,
          serviceLabel: "Lavagem completa",
          priceInCents: 3999,
          priceType: "STARTING_AT",
          minPriceInCents: 4000,
          isCourtesy: false,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote service validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "O valor não pode ser menor que o mínimo do serviço.",
          path: ["services", 0, "priceInCents"],
        }),
      ]),
    );
  });

  it("rejects a range service price above the maximum", () => {
    const result = quoteServicesStepSchema.safeParse({
      services: [
        {
          serviceId,
          serviceLabel: "Polimento",
          priceInCents: 10001,
          priceType: "RANGE",
          minPriceInCents: 4000,
          maxPriceInCents: 10000,
          isCourtesy: false,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote service validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "O valor não pode ultrapassar o máximo do serviço.",
          path: ["services", 0, "priceInCents"],
        }),
      ]),
    );
  });

  it("skips minimum and maximum validation for courtesy services", () => {
    const result = quoteServicesStepSchema.safeParse({
      services: [
        {
          serviceId,
          serviceLabel: "Polimento",
          priceInCents: 0,
          priceType: "RANGE",
          minPriceInCents: 4000,
          maxPriceInCents: 10000,
          isCourtesy: true,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe("quotePaymentStepSchema", () => {
  it("accepts a backend-compatible card payment option", () => {
    const result = quotePaymentStepSchema.safeParse({
      paymentOptions: [
        {
          method: "CARD",
          label: "Cartão em até 3x",
          installments: 3,
          interestFree: true,
          discountType: "PERCENTAGE",
          discountValue: 5,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("normalizes empty optional payment fields to null", () => {
    const result = quotePaymentStepSchema.safeParse({
      paymentOptions: [
        {
          method: "PIX",
          label: "Pix",
          installments: "",
          interestFree: null,
          discountType: null,
          discountValue: "",
        },
      ],
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected quote payment validation to pass.");
    }

    expect(result.data.paymentOptions[0]).toEqual({
      method: "PIX",
      label: "Pix",
      installments: null,
      interestFree: null,
      discountType: null,
      discountValue: null,
    });
  });

  it("normalizes quote validity and terms fields", () => {
    const result = quotePaymentStepSchema.safeParse({
      paymentOptions: [
        {
          method: "PIX",
          label: "Pix",
        },
      ],
      expiresAt: "15/08/2999",
      termsAndConditions: "  Válido enquanto houver agenda disponível.  ",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error("Expected quote payment metadata validation to pass.");
    }

    expect(result.data.expiresAt).toBe("2999-08-16T02:59:59.999Z");
    expect(result.data.termsAndConditions).toBe("Válido enquanto houver agenda disponível.");
  });

  it("rejects an invalid quote validity date", () => {
    const result = quotePaymentStepSchema.safeParse({
      paymentOptions: [
        {
          method: "PIX",
          label: "Pix",
        },
      ],
      expiresAt: "31/02/2026",
      termsAndConditions: "",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote validity validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Informe uma data válida.",
          path: ["expiresAt"],
        }),
      ]),
    );
  });

  it("rejects a past quote validity date", () => {
    const result = quotePaymentStepSchema.safeParse({
      paymentOptions: [
        {
          method: "PIX",
          label: "Pix",
        },
      ],
      expiresAt: "01/01/2000",
      termsAndConditions: "",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected past quote validity validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "A validade deve ser hoje ou uma data futura.",
          path: ["expiresAt"],
        }),
      ]),
    );
  });

  it("rejects a payment option without label", () => {
    const result = quotePaymentStepSchema.safeParse({
      paymentOptions: [
        {
          method: "CASH",
          label: "",
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote payment validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Informe a descrição da forma de pagamento.",
          path: ["paymentOptions", 0, "label"],
        }),
      ]),
    );
  });

  it("rejects zero installments", () => {
    const result = quotePaymentStepSchema.safeParse({
      paymentOptions: [
        {
          method: "CARD",
          label: "Cartão",
          installments: 0,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects an enabled discount without value", () => {
    const result = quotePaymentStepSchema.safeParse({
      paymentOptions: [
        {
          method: "PIX",
          label: "Pix com desconto",
          discountType: "PERCENTAGE",
          discountValue: null,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote payment validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Informe o valor do desconto.",
          path: ["paymentOptions", 0, "discountValue"],
        }),
      ]),
    );
  });

  it("rejects an enabled discount with zero value", () => {
    const result = quotePaymentStepSchema.safeParse({
      paymentOptions: [
        {
          method: "PIX",
          label: "Pix com desconto",
          discountType: "AMOUNT",
          discountValue: 0,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote payment validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "O desconto deve ser maior que zero.",
          path: ["paymentOptions", 0, "discountValue"],
        }),
      ]),
    );
  });
});

describe("createQuoteFormSchema", () => {
  it("rejects amount discounts greater than the services total", () => {
    const result = createQuoteFormSchema.safeParse(
      makeCreateQuoteFormInput({
        discountType: "AMOUNT",
        discountValue: 10001,
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote form validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "O desconto não pode ser maior que o total dos serviços.",
          path: ["stepThree", "paymentOptions", 0, "discountValue"],
        }),
      ]),
    );
  });

  it("accepts amount discounts equal to the services total", () => {
    const result = createQuoteFormSchema.safeParse(
      makeCreateQuoteFormInput({
        discountType: "AMOUNT",
        discountValue: 10000,
      }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects percentage discounts greater than 100", () => {
    const result = createQuoteFormSchema.safeParse(
      makeCreateQuoteFormInput({
        discountType: "PERCENTAGE",
        discountValue: 101,
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected quote form validation to fail.");
    }

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "O desconto percentual não pode ultrapassar 100%.",
          path: ["stepThree", "paymentOptions", 0, "discountValue"],
        }),
      ]),
    );
  });
});

function makeCreateQuoteFormInput({
  discountType,
  discountValue,
}: {
  discountType: "PERCENTAGE" | "AMOUNT";
  discountValue: number;
}) {
  return {
    stepOne: {
      customerId: null,
      customer: {
        name: "Cliente teste",
        cpfCnpj: null,
        phone: null,
        email: null,
      },
      vehicleId: null,
      vehicleLabel: null,
      vehicle: {
        plate: null,
        brand: "Honda",
        model: "Civic",
        color: null,
        year: null,
      },
    },
    stepTwo: {
      services: [
        {
          serviceName: "Lavagem completa",
          priceInCents: 10000,
          isCourtesy: false,
        },
      ],
    },
    stepThree: {
      paymentOptions: [
        {
          method: "PIX",
          label: "Pix com desconto",
          installments: null,
          interestFree: null,
          discountType,
          discountValue,
        },
      ],
    },
  };
}

function makeCustomerVehicleStepInput(
  overrides: Partial<Parameters<typeof quoteCustomerVehicleStepSchema.safeParse>[0]> = {},
) {
  return {
    customerId: null,
    customer: {
      name: "Cliente teste",
      cpfCnpj: null,
      phone: null,
      email: null,
    },
    vehicleId: null,
    vehicleLabel: null,
    vehicle: {
      plate: null,
      brand: "Honda",
      model: "Civic",
      color: null,
      year: null,
    },
    ...overrides,
  };
}
