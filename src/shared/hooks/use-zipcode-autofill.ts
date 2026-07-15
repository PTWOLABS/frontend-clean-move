import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useWatch,
  type Control,
  type FieldValues,
  type UseFormClearErrors,
  type UseFormGetValues,
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
  setValue: UseFormSetValue<FieldValues>;
};

type UseZipCodeAutofillOptions = {
  enabled?: boolean;
};

function hasAddressContent(street: unknown, city: unknown, state: unknown): boolean {
  return Boolean(
    String(street ?? "").trim() || String(city ?? "").trim() || String(state ?? "").trim(),
  );
}

/**
 * ViaCEP autofill contract:
 * - Queries when CEP has 8 digits AND street/city/state are empty for that CEP.
 * - Skips network when the form is hydrated (or already filled) for the current CEP.
 * - Changing the CEP forces a new lookup even if address fields still have previous values.
 * - Clearing the address fields for the same CEP also allows a refill (from cache or network).
 * - Not found (null): clear field errors, expose zipCodeNotFound — do not block submit.
 */
export function useZipCodeAutofill(
  form: ZipCodeAutofillForm,
  fields: ZipCodeAutofillFieldPaths,
  options?: UseZipCodeAutofillOptions,
) {
  const { clearErrors, control, getValues, setValue } = form;
  const fetchedZipRef = useRef<string | null>(null);

  const [filledForZip, setFilledForZip] = useState<string | null>(null);
  const [processedZip, setProcessedZip] = useState<string | null>(null);
  const [forceLookup, setForceLookup] = useState(false);
  const [trackedZip, setTrackedZip] = useState<string | null>(null);
  const [initialZip, setInitialZip] = useState<string | null>(null);

  const zipCode = useWatch({ control, name: fields.zipCode });
  const street = useWatch({ control, name: fields.street });
  const city = useWatch({ control, name: fields.city });
  const state = useWatch({ control, name: fields.state });
  const normalizedZipCode = onlyDigits(String(zipCode ?? ""));
  const hasAddress = hasAddressContent(street, city, state);

  useEffect(() => {
    if (normalizedZipCode.length !== 8) {
      return;
    }

    if (initialZip === null) {
      setInitialZip(normalizedZipCode);
    }

    if (trackedZip === null) {
      setTrackedZip(normalizedZipCode);
      if (hasAddress) {
        setFilledForZip(normalizedZipCode);
        setProcessedZip(normalizedZipCode);
      }
      return;
    }

    if (trackedZip !== normalizedZipCode) {
      setTrackedZip(normalizedZipCode);
      setFilledForZip(null);
      setProcessedZip(null);
      setForceLookup(true);
      return;
    }

    if (hasAddress && !forceLookup && filledForZip === null) {
      setFilledForZip(normalizedZipCode);
      setProcessedZip(normalizedZipCode);
      return;
    }

    if (
      !hasAddress &&
      (filledForZip === normalizedZipCode || processedZip === normalizedZipCode)
    ) {
      setFilledForZip(null);
      setProcessedZip(null);
    }
  }, [
    filledForZip,
    forceLookup,
    hasAddress,
    initialZip,
    normalizedZipCode,
    processedZip,
    trackedZip,
  ]);

  const addressAlreadyFilledForCurrentZip =
    normalizedZipCode.length === 8 &&
    hasAddress &&
    !forceLookup &&
    (filledForZip === normalizedZipCode ||
      (filledForZip === null && trackedZip === null) ||
      (filledForZip === null &&
        trackedZip === normalizedZipCode &&
        processedZip === normalizedZipCode));

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
      fetchedZipRef.current = zip;
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
      setForceLookup(false);
      return;
    }

    if (fetchedZipRef.current !== normalizedZipCode) {
      return;
    }

    if (processedZip === normalizedZipCode && !forceLookup) {
      return;
    }

    const userChangedZipCode =
      initialZip !== null && normalizedZipCode.length === 8 && normalizedZipCode !== initialZip;

    const isHydration =
      !userChangedZipCode &&
      !forceLookup &&
      processedZip === null &&
      normalizedZipCode.length === 8 &&
      hasAddressContent(getValues(fields.street), getValues(fields.city), getValues(fields.state));

    setProcessedZip(normalizedZipCode);
    setFilledForZip(normalizedZipCode);
    setForceLookup(false);

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
    forceLookup,
    getValues,
    initialZip,
    isSuccess,
    normalizedZipCode,
    processedZip,
    setValue,
  ]);

  return {
    isFetchingAddress: isFetching,
    hasAddressFetchError: isError,
    zipCodeNotFound: isSuccess && address == null,
  };
}
