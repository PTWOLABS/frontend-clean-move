import {
  Building2,
  Hash,
  Home,
  LoaderCircle,
  MapPin,
  MapPinned,
  Navigation,
} from 'lucide-react';

import { RegisterTextField } from './register-text-field';
import { StepActions } from './step-actions';
import {
  addressStepSchema,
  type AddressStepValues,
} from '../schemas/register-schema';
import { useZipCodeAutofill } from '../hooks/use-zipcode-autofill';

type AddressStepProps = {
  onBack: (values: AddressStepValues) => void;
};

export function AddressStep({ onBack }: AddressStepProps) {
  const { hasAddressFetchError, isFetchingAddress } = useZipCodeAutofill();

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[0.78fr_1.22fr]">
        <RegisterTextField
          id="register-zip-code"
          name="zipCode"
          mask="_____-___"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          label="CEP"
          icon={MapPin}
          fieldClassName="sm:col-span-2"
          disabled={isFetchingAddress}
          image={
            isFetchingAddress ? (
              <LoaderCircle
                aria-hidden
                className="size-5 animate-spin text-[#94A3B8]"
              />
            ) : undefined
          }
        />

        {isFetchingAddress || hasAddressFetchError ? (
          <p className="-mt-1 text-[11px] font-medium leading-4 text-[#94A3B8] sm:col-span-2">
            {isFetchingAddress
              ? 'Buscando endereço pelo CEP...'
              : 'Não foi possível consultar o CEP. Preencha o endereço manualmente.'}
          </p>
        ) : null}

        <RegisterTextField
          id="register-street"
          name="street"
          autoComplete="address-line1"
          placeholder="Rua da empresa"
          label="Rua"
          icon={Navigation}
          fieldClassName="sm:col-span-2"
          disabled={isFetchingAddress}
        />

        <RegisterTextField
          id="register-number"
          name="number"
          autoComplete="address-line2"
          placeholder="123"
          label="Número"
          icon={Hash}
          disabled={isFetchingAddress}
        />

        <RegisterTextField
          id="register-city"
          name="city"
          autoComplete="address-level2"
          placeholder="Cidade"
          label="Cidade"
          icon={Building2}
          disabled={isFetchingAddress}
        />

        <RegisterTextField
          id="register-state"
          name="state"
          autoComplete="address-level1"
          placeholder="UF"
          label="Estado"
          icon={MapPinned}
          maxLength={2}
          disabled={isFetchingAddress}
        />

        <RegisterTextField
          id="register-complement"
          name="complement"
          autoComplete="address-line3"
          placeholder="Sala, bloco ou referência"
          label="Complemento"
          icon={Home}
          disabled={isFetchingAddress}
        />
      </div>

      <StepActions<AddressStepValues>
        schema={addressStepSchema}
        disabled={isFetchingAddress}
        onBack={onBack}
        submitLabel="Finalizar cadastro"
      />
    </>
  );
}
