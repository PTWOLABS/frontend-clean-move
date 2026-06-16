import type { CreateServiceFormInput } from "../schemas/create-service-schema";

const API_PATH_TO_FORM_FIELD: Record<string, keyof CreateServiceFormInput> = {
  serviceName: "serviceName",
  categoryId: "categoryId",
  description: "description",
  "estimatedDuration.minInMinutes": "minInMinutes",
  "estimatedDuration.maxInMinutes": "maxInMinutes",
  "priceSpecification.fixedPriceInCents": "fixedPriceInReais",
  "priceSpecification.minPriceInCents": "minPriceInReais",
  "priceSpecification.maxPriceInCents": "maxPriceInReais",
  price: "fixedPriceInReais",
  isActive: "isActive",
};

export function mapServiceApiPathToFormField(
  apiPath: string,
): keyof CreateServiceFormInput | undefined {
  return API_PATH_TO_FORM_FIELD[apiPath];
}

export function mapServiceApiFieldErrorsToForm(
  fieldErrors: Record<string, string>,
): Partial<Record<keyof CreateServiceFormInput, string>> {
  return Object.entries(fieldErrors).reduce<Partial<Record<keyof CreateServiceFormInput, string>>>(
    (mapped, [apiPath, message]) => {
      const formField = mapServiceApiPathToFormField(apiPath);
      if (formField && !mapped[formField]) {
        mapped[formField] = message;
      }
      return mapped;
    },
    {},
  );
}
