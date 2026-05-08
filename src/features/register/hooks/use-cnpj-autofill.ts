import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';

import { fetchCompanyByCnpj } from '../api/brasilapi';
import { type CompanyStepValues } from '../schemas/register-schema';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export function useCnpjAutofill() {
  const {
    clearErrors,
    control,
    setError,
    setValue,
  } = useFormContext<CompanyStepValues>();
  const cnpj = useWatch({ control, name: 'cnpj' });
  const normalizedCnpj = onlyDigits(cnpj ?? '');

  const {
    data: company,
    isError,
    isFetching,
    isSuccess,
  } = useQuery({
    enabled: normalizedCnpj.length === 14,
    queryKey: ['brasilapi', 'cnpj', normalizedCnpj],
    queryFn: ({ signal }) => fetchCompanyByCnpj(normalizedCnpj, signal),
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    if (!company) {
      setError('cnpj', {
        type: 'manual',
        message: 'CNPJ não encontrado.',
      });
      return;
    }

    clearErrors('cnpj');

    setValue('legalName', company.legalName, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('tradeName', company.tradeName, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [clearErrors, company, isSuccess, setError, setValue]);

  return {
    hasCompanyFetchError: isError,
    isFetchingCompany: isFetching,
  };
}
