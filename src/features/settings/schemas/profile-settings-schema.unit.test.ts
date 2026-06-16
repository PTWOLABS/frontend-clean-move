import { describe, expect, it } from "vitest";

import {
  canSaveProfileSettings,
  createProfileSettingsSchema,
  getProfileChangedPayload,
  hasProfileChanges,
  mapProfileFormToPatchPayload,
  profileSettingsSchema,
} from "./profile-settings-schema";

const emptyFormValues = {
  name: "",
  email: "",
  phone: "",
  address: {
    zipCode: "",
    street: "",
    complement: "",
    city: "",
    state: "",
    country: "Brasil",
  },
};

const fullFormValues = {
  name: "Pedro William",
  email: "pedro@email.com",
  phone: "(11) 99999-1234",
  address: {
    zipCode: "01310-100",
    street: "Av. Paulista",
    complement: "Sala 1",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
  },
};

describe("profileSettingsSchema", () => {
  it("should accept all fields empty", () => {
    const result = profileSettingsSchema.safeParse(emptyFormValues);

    expect(result.success).toBe(true);
  });

  it("should accept only name filled", () => {
    const result = profileSettingsSchema.safeParse({
      ...emptyFormValues,
      name: "Pedro William",
    });

    expect(result.success).toBe(true);
  });

  it("should accept empty phone", () => {
    const result = profileSettingsSchema.safeParse(emptyFormValues);

    expect(result.success).toBe(true);
  });

  it("should reject invalid phone when filled", () => {
    const result = profileSettingsSchema.safeParse({
      ...emptyFormValues,
      phone: "(11) 9999",
    });

    expect(result.success).toBe(false);
  });

  it("should accept valid phone when filled", () => {
    const result = profileSettingsSchema.safeParse({
      ...emptyFormValues,
      phone: "(11) 99999-1234",
    });

    expect(result.success).toBe(true);
  });

  it("should reject invalid zip code when filled", () => {
    const result = profileSettingsSchema.safeParse({
      ...emptyFormValues,
      address: { ...emptyFormValues.address, zipCode: "1234" },
    });

    expect(result.success).toBe(false);
  });

  it("should accept valid zip code when filled", () => {
    const result = profileSettingsSchema.safeParse({
      ...emptyFormValues,
      address: { ...emptyFormValues.address, zipCode: "01310-100" },
    });

    expect(result.success).toBe(true);
  });
});

describe("getProfileChangedPayload", () => {
  const initialPayload = mapProfileFormToPatchPayload(
    profileSettingsSchema.parse({
      name: "Pedro William",
      email: "pedro@email.com",
      phone: "",
      address: {
        zipCode: "",
        street: "",
        complement: "",
        city: "",
        state: "SP",
        country: "Brasil",
      },
    }),
  );

  it("should return empty payload when nothing changed", () => {
    const currentPayload = mapProfileFormToPatchPayload(
      profileSettingsSchema.parse({
        name: "Pedro William",
        email: "pedro@email.com",
        phone: "",
        address: {
          zipCode: "",
          street: "",
          complement: "",
          city: "",
          state: "SP",
          country: "Brasil",
        },
      }),
    );

    expect(getProfileChangedPayload(currentPayload, initialPayload)).toEqual({});
    expect(hasProfileChanges(currentPayload, initialPayload)).toBe(false);
  });

  it("should return only name when name changed", () => {
    const currentPayload = mapProfileFormToPatchPayload(
      profileSettingsSchema.parse({
        ...fullFormValues,
        name: "Pedro Silva",
        phone: "",
        address: {
          ...fullFormValues.address,
          zipCode: "",
          street: "",
          complement: "",
          city: "",
        },
      }),
    );

    expect(getProfileChangedPayload(currentPayload, initialPayload)).toEqual({
      name: "Pedro Silva",
    });
  });

  it("should return full address when any address field changed", () => {
    const currentPayload = mapProfileFormToPatchPayload(
      profileSettingsSchema.parse({
        name: "Pedro William",
        email: "pedro@email.com",
        phone: "",
        address: {
          zipCode: "01310-100",
          street: "Rua Customizada",
          complement: "",
          city: "São Paulo",
          state: "SP",
          country: "Brasil",
        },
      }),
    );

    expect(getProfileChangedPayload(currentPayload, initialPayload)).toEqual({
      address: {
        street: "Rua Customizada",
        complement: null,
        country: "Brasil",
        state: "SP",
        zipCode: "01310100",
        city: "São Paulo",
      },
    });
    expect(hasProfileChanges(currentPayload, initialPayload)).toBe(true);
  });
});

describe("canSaveProfileSettings", () => {
  const initialFormValues = {
    name: "Pedro William",
    email: "pedro@email.com",
    phone: "",
    address: {
      zipCode: "",
      street: "",
      complement: "",
      city: "",
      state: "SP",
      country: "Brasil",
    },
  };

  const initialPayload = mapProfileFormToPatchPayload(
    profileSettingsSchema.parse(initialFormValues),
  );

  it("should allow saving when only name changed", () => {
    expect(
      canSaveProfileSettings(
        {
          ...initialFormValues,
          name: "Pedro Silva",
        },
        initialPayload,
      ),
    ).toBe(true);
  });

  it("should block saving when address changed without complete address", () => {
    expect(
      canSaveProfileSettings(
        {
          ...initialFormValues,
          address: {
            ...initialFormValues.address,
            street: "Rua Customizada",
          },
        },
        initialPayload,
      ),
    ).toBe(false);
  });

  it("should allow saving when address changed with complete address", () => {
    expect(
      canSaveProfileSettings(
        {
          ...initialFormValues,
          address: {
            zipCode: "01310-100",
            street: "Rua Customizada",
            complement: "",
            city: "São Paulo",
            state: "SP",
            country: "Brasil",
          },
        },
        initialPayload,
      ),
    ).toBe(true);
  });

  it("should surface address validation errors when address changed", () => {
    const schema = createProfileSettingsSchema(initialPayload);
    const result = schema.safeParse({
      ...initialFormValues,
      address: {
        ...initialFormValues.address,
        street: "Rua Customizada",
      },
    });

    expect(result.success).toBe(false);
  });
});
