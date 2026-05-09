import { Building2, FileText, LoaderCircle, Store } from "lucide-react";

import { RegisterTextField } from "./register-text-field";
import { StepActions } from "./step-actions";
import { companyStepSchema, type CompanyStepValues } from "../schemas/register-schema";
import { useCnpjAutofill } from "../hooks/use-cnpj-autofill";

type CompanyStepProps = {
  onBack: (values: CompanyStepValues) => void;
};

export function CompanyStep({ onBack }: CompanyStepProps) {
  const { hasCompanyFetchError, isFetchingCompany } = useCnpjAutofill();

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
          disabled={isFetchingCompany}
          image={
            isFetchingCompany ? (
              <LoaderCircle aria-hidden className="size-5 animate-spin text-[#94A3B8]" />
            ) : undefined
          }
        />

        {isFetchingCompany || hasCompanyFetchError ? (
          <p className="-mt-1 text-[11px] font-medium leading-4 text-[#94A3B8]">
            {isFetchingCompany
              ? "Buscando dados da empresa pelo CNPJ..."
              : "Não foi possível consultar o CNPJ. Preencha os dados manualmente."}
          </p>
        ) : null}

        <RegisterTextField
          id="register-legal-name"
          name="legalName"
          type="text"
          autoComplete="organization"
          placeholder="Razão social da empresa"
          label="Razão social"
          icon={Building2}
          disabled={isFetchingCompany}
        />

        <RegisterTextField
          id="register-trade-name"
          name="tradeName"
          type="text"
          autoComplete="organization-title"
          placeholder="Nome usado comercialmente"
          label="Nome fantasia"
          icon={Store}
          disabled={isFetchingCompany}
        />
      </div>

      <StepActions<CompanyStepValues>
        schema={companyStepSchema}
        disabled={isFetchingCompany}
        onBack={onBack}
        submitLabel="Continuar"
      />
    </>
  );
}
