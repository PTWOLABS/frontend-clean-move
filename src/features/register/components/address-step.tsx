import {
  Building2,
  Hash,
  Home,
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

type AddressStepProps = {
  onBack: (values: AddressStepValues) => void;
};

export function AddressStep({ onBack }: AddressStepProps) {
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
        />

        <RegisterTextField
          id="register-street"
          name="street"
          autoComplete="address-line1"
          placeholder="Rua da empresa"
          label="Rua"
          icon={Navigation}
          fieldClassName="sm:col-span-2"
        />

        <RegisterTextField
          id="register-number"
          name="number"
          autoComplete="address-line2"
          placeholder="123"
          label="Número"
          icon={Hash}
        />

        <RegisterTextField
          id="register-city"
          name="city"
          autoComplete="address-level2"
          placeholder="Cidade"
          label="Cidade"
          icon={Building2}
        />

        <RegisterTextField
          id="register-state"
          name="state"
          autoComplete="address-level1"
          placeholder="UF"
          label="Estado"
          icon={MapPinned}
          maxLength={2}
        />

        <RegisterTextField
          id="register-complement"
          name="complement"
          autoComplete="address-line3"
          placeholder="Sala, bloco ou referência"
          label="Complemento"
          icon={Home}
        />
      </div>

      <StepActions<AddressStepValues>
        schema={addressStepSchema}
        onBack={onBack}
        submitLabel="Finalizar cadastro"
      />
    </>
  );
}
