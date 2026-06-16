import { useFormContext } from "react-hook-form";

import {
  useZipCodeAutofill as useZipCodeAutofillBase,
  type ZipCodeAutofillForm,
} from "@/shared/hooks/use-zipcode-autofill";

import { type AddressStepValues } from "../schemas/register-schema";

const registerAddressFields = {
  zipCode: "zipCode",
  street: "street",
  city: "city",
  state: "state",
  complement: "complement",
} as const;

export function useZipCodeAutofill() {
  const form = useFormContext<AddressStepValues>();
  return useZipCodeAutofillBase(form as unknown as ZipCodeAutofillForm, registerAddressFields);
}
