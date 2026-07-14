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
const ZIP_CACHE_MS = 1000 * 60 * 10;

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

function hasAddressContent(street: unknown, city: unknown, state: unknown): boolean {
  return Boolean(String(street ?? "").trim() || String(city ?? "").trim() || String(state ?? "").trim());
}

export function useZipCodeAutofill(
  form: ZipCodeAutofillForm,
  fields: ZipCodeAutofillFieldPaths,
  options?: UseZipCodeAutofillOptions,
) {
  const { clearErrors, control, getValues, setValue } = form;
  const processedZipCodeRef = useRef<string | null>(null);
  const fetchedZipCodeRef = useRef<string | null>(null);
  const filledForZipRef = useRef<string | null>(null);
  const initialNormalizedZipRef = useRef<string | null>(null);

  const zipCode = useWatch({ control, name: fields.zipCode });
  const street = useWatch({ control, name: fields.street });
  const city = useWatch({ control, name: fields.city });
  const state = useWatch({ control, name: fields.state });
  const normalizedZipCode = onlyDigits(String(zipCode ?? ""));

  if (initialNormalizedZipRef.current === null && normalizedZipCode.length === 8) {
    initialNormalizedZipRef.current = normalizedZipCode;

    if (hasAddressContent(street, city, state)) {
      filledForZipRef.current = normalizedZipCode;
      processedZipCodeRef.current = normalizedZipCode;
    }
  }

  useEffect(() => {
    if (normalizedZipCode.length !== 8) {
      return;
    }

    if (filledForZipRef.current !== null && filledForZipRef.current !== normalizedZipCode) {
      filledForZipRef.current = null;
      processedZipCodeRef.current = null;
    }
  }, [normalizedZipCode]);

  const addressAlreadyFilledForCurrentZip =
    normalizedZipCode.length === 8 &&
    hasAddressContent(street, city, state) &&
    filledForZipRef.current === normalizedZipCode;

  const isEnabled =
    options?.enabled !== false &&
    normalizedZipCode.length === 8 &&
    !addressAlreadyFilledForCurrentZip;

  const {
    data: address,
    isError,
    isFetching,
    isSuccess,
  } = useQuery({
    enabled: isEnabled,
    queryKey: ["viacep", normalizedZipCode],
    queryFn: async ({ queryKey, signal }) => {
      const zip = String(queryKey[1] ?? "");
      const result = await fetchAddressByZipCode(zip, signal);
      fetchedZipCodeRef.current = zip;
      return result;
    },
    retry: false,
    staleTime: ZIP_CACHE_MS,
    gcTime: ZIP_CACHE_MS,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    if (!address) {
      clearErrors(fields.zipCode);
      return;
    }

    if (fetchedZipCodeRef.current !== normalizedZipCode) {
      return;
    }

    if (processedZipCodeRef.current === normalizedZipCode) {
      return;
    }

    const initialZipCode = initialNormalizedZipRef.current;
    const userChangedZipCode =
      initialZipCode !== null &&
      normalizedZipCode.length === 8 &&
      normalizedZipCode !== initialZipCode;

    const isHydration =
      !userChangedZipCode &&
      processedZipCodeRef.current === null &&
      normalizedZipCode.length === 8 &&
      hasAddressContent(getValues(fields.street), getValues(fields.city), getValues(fields.state));

    processedZipCodeRef.current = normalizedZipCode;
    filledForZipRef.current = normalizedZipCode;

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
    setValue,
  ]);

  return {
    isFetchingAddress: isFetching,
    hasAddressFetchError: isError,
    zipCodeNotFound: isSuccess && address == null,
  };
}
