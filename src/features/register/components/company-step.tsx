import { Building2, FileText, Store } from 'lucide-react';

import { RegisterTextField } from './register-text-field';
import { StepActions } from './step-actions';
import {
  companyStepSchema,
  type CompanyStepValues,
} from '../schemas/register-schema';

type CompanyStepProps = {
  onBack: (values: CompanyStepValues) => void;
};

export function CompanyStep({ onBack }: CompanyStepProps) {
  return (
    <>
      <div className="grid gap-3">
        <RegisterTextField
          id="register-cnpj"
          name="cnpj"
          mask="__.___.___/____-__"
          inputMode="numeric"
          autoComplete="organization"
          placeholder="00.000.000/0000-00"
          label="CNPJ"
          icon={FileText}
        />

        <RegisterTextField
          id="register-legal-name"
          name="legalName"
          type="text"
          autoComplete="organization"
          placeholder="Razão social da empresa"
          label="Razão social"
          icon={Building2}
        />

        <RegisterTextField
          id="register-trade-name"
          name="tradeName"
          type="text"
          autoComplete="organization-title"
          placeholder="Nome usado comercialmente"
          label="Nome fantasia"
          icon={Store}
        />
      </div>

      <StepActions<CompanyStepValues>
        schema={companyStepSchema}
        onBack={onBack}
        submitLabel="Continuar"
      />
    </>
  );
}
