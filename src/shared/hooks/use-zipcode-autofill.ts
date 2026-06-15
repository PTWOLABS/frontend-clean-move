import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useWatch,
  type Control,
  type FieldValues,
  type UseFormClearErrors,
  type UseFormGetValues,
  type UseFormSetError,
  type UseFormSetValue,
} from "react-hook-form";

import { fetchAddressByZipCode } from "@/shared/api/viacep";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export type ZipCodeAutofillFieldPaths = {
  zipCode: string;
  street: string;
  city: string;
  state: string;
  complement?: string;
};

export type ZipCodeAutofillForm = {
  clearErrors: UseFormClearErrors<FieldValues>;
  control: Control<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
  setError: UseFormSetError<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
};

type UseZipCodeAutofillOptions = {
  enabled?: boolean;
};

export function useZipCodeAutofill(
  form: ZipCodeAutofillForm,
  fields: ZipCodeAutofillFieldPaths,
  options?: UseZipCodeAutofillOptions,
) {
  const { clearErrors, control, getValues, setError, setValue } = form;
  const previousZipCodeRef = useRef("");
  const zipCode = useWatch({ control, name: fields.zipCode });
  const normalizedZipCode = onlyDigits(String(zipCode ?? ""));
  const isEnabled = options?.enabled !== false && normalizedZipCode.length === 8;

  const {
    data: address,
    isError,
    isFetching,
    isSuccess,
  } = useQuery({
    enabled: isEnabled,
    queryKey: ["viacep", normalizedZipCode],
    queryFn: ({ signal }) => fetchAddressByZipCode(normalizedZipCode, signal),
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    if (!address) {
      setError(fields.zipCode, {
        type: "manual",
        message: "CEP não encontrado.",
      });
      return;
    }

    const previousZipCode = previousZipCodeRef.current;
    const isHydration =
      normalizedZipCode.length === 8 &&
      previousZipCode.length < 8 &&
      Boolean(getValues(fields.street) || getValues(fields.city) || getValues(fields.state));

    previousZipCodeRef.current = normalizedZipCode;

    if (isHydration) {
      return;
    }

    clearErrors(fields.zipCode);

    setValue(fields.street, address.street, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(fields.city, address.city, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(fields.state, address.state, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (fields.complement && address.complement) {
      const currentComplement = getValues(fields.complement);
      if (!currentComplement) {
        setValue(fields.complement, address.complement, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }, [
    address,
    clearErrors,
    fields.city,
    fields.complement,
    fields.state,
    fields.street,
    fields.zipCode,
    getValues,
    isSuccess,
    normalizedZipCode,
    setError,
    setValue,
  ]);

  return {
    isFetchingAddress: isFetching,
    hasAddressFetchError: isError,
  };
}
