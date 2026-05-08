import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';

import { fetchAddressByZipCode } from '../api/viacep';
import { type AddressStepValues } from '../schemas/register-schema';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export function useZipCodeAutofill() {
  const {
    clearErrors,
    control,
    getValues,
    setError,
    setValue,
  } = useFormContext<AddressStepValues>();
  const zipCode = useWatch({ control, name: 'zipCode' });
  const normalizedZipCode = onlyDigits(zipCode ?? '');

  const {
    data: address,
    isError,
    isFetching,
    isSuccess,
  } = useQuery({
    enabled: normalizedZipCode.length === 8,
    queryKey: ['viacep', normalizedZipCode],
    queryFn: ({ signal }) => fetchAddressByZipCode(normalizedZipCode, signal),
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    if (!address) {
      setError('zipCode', {
        type: 'manual',
        message: 'CEP não encontrado.',
      });
      return;
    }

    clearErrors('zipCode');

    setValue('street', address.street, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('city', address.city, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('state', address.state, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (address.complement && !getValues('complement')) {
      setValue('complement', address.complement, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [address, clearErrors, getValues, isSuccess, setError, setValue]);

  return {
    isFetchingAddress: isFetching,
    hasAddressFetchError: isError,
  };
}
