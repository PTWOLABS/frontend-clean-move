"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { RegisterSteps } from "./register-steps";
import { Form } from "@/shared/forms/form";
import { AccountStep } from "./account-step";
import { CompanyStep } from "./company-step";
import { AddressStep } from "./address-step";
import { RegisterHeader } from "./register-header";
import {
  accountStepSchema,
  addressStepSchema,
  companyStepSchema,
  registerDefaultValues,
  registerSchema,
  type AccountStepValues,
  type AddressStepValues,
  type CompanyStepValues,
  type RegisterFormValues,
} from "../schemas/register-schema";
import { useRegisterEstablishment } from "../hooks/use-register-establishment";

const stepHeaders = [
  {
    label: "Conta",
    title: "Crie sua conta",
    description: "Comece a configurar sua plataforma de gestão com poucos passos.",
  },
  {
    label: "Empresa",
    title: "Dados da empresa",
    description: "Agora informe os dados principais da sua empresa para continuar o cadastro.",
  },
  {
    label: "Endereço",
    title: "Endereço da empresa",
    description: "Agora informe o endereço completo da empresa para finalizar o cadastro.",
  },
] as const;

const getAccountValues = (data: RegisterFormValues): AccountStepValues => ({
  fullName: data.fullName,
  phone: data.phone,
  email: data.email,
  password: data.password,
});

const getCompanyValues = (data: RegisterFormValues): CompanyStepValues => ({
  cnpj: data.cnpj,
  legalName: data.legalName,
  tradeName: data.tradeName,
});

const getAddressValues = (data: RegisterFormValues): AddressStepValues => ({
  zipCode: data.zipCode,
  street: data.street,
  number: data.number,
  city: data.city,
  state: data.state,
  complement: data.complement,
});

const stepFormOptions = {
  mode: "onBlur",
  reValidateMode: "onChange",
} as const;

export function RegisterForm() {
  const [stepOrder, setStepOrder] = useState(0);
  const [registerData, setRegisterData] = useState<RegisterFormValues>(registerDefaultValues);
  const { mutateAsync: registerEstablishmentAsync, isPending: isRegistering } =
    useRegisterEstablishment();

  const steps = useMemo(() => stepHeaders.map(({ label }) => ({ label })), []);
  const currentHeader = stepHeaders[stepOrder];

  const handleAccountSubmit = (data: AccountStepValues) => {
    setRegisterData((current) => ({ ...current, ...data }));
    setStepOrder(1);
  };

  const handleCompanySubmit = (data: CompanyStepValues) => {
    setRegisterData((current) => ({ ...current, ...data }));
    setStepOrder(2);
  };

  const handleAddressSubmit = async (data: AddressStepValues) => {
    const nextRegisterData = {
      ...registerData,
      ...data,
    };

    const result = registerSchema.safeParse(nextRegisterData);

    if (!result.success) {
      return;
    }

    setRegisterData(result.data);

    try {
      await registerEstablishmentAsync(result.data);
    } catch {
      // Feedback em `useRegisterEstablishment` (toast).
    }
  };

  const handleCompanyBack = (data: CompanyStepValues) => {
    setRegisterData((current) => ({ ...current, ...data }));
    setStepOrder(0);
  };

  const handleAddressBack = (data: AddressStepValues) => {
    setRegisterData((current) => ({ ...current, ...data }));
    setStepOrder(1);
  };

  return (
    <div className="relative z-10 w-full max-w-[420px]">
      <RegisterHeader title={currentHeader.title} description={currentHeader.description} />

      <RegisterSteps steps={steps} activatedStep={stepOrder} />

      {stepOrder === 0 ? (
        <Form<AccountStepValues>
          key="account-step"
          className="mt-6 space-y-5"
          onSubmit={handleAccountSubmit}
          schema={accountStepSchema}
          options={{
            ...stepFormOptions,
            defaultValues: getAccountValues(registerData),
          }}
        >
          <AccountStep />
        </Form>
      ) : null}

      {stepOrder === 1 ? (
        <Form<CompanyStepValues>
          key="company-step"
          className="mt-6 space-y-5"
          onSubmit={handleCompanySubmit}
          schema={companyStepSchema}
          options={{
            ...stepFormOptions,
            defaultValues: getCompanyValues(registerData),
          }}
        >
          <CompanyStep onBack={handleCompanyBack} />
        </Form>
      ) : null}

      {stepOrder === 2 ? (
        <Form<AddressStepValues>
          key="address-step"
          className="mt-6 space-y-5"
          onSubmit={handleAddressSubmit}
          schema={addressStepSchema}
          options={{
            ...stepFormOptions,
            defaultValues: getAddressValues(registerData),
          }}
        >
          <AddressStep onBack={handleAddressBack} registrationPending={isRegistering} />
        </Form>
      ) : null}

      <p className="mt-6 text-center text-sm text-[#94A3B8]">
        Já possui uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-[#3B82F6] transition-colors hover:text-[#60A5FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35"
        >
          Fazer login
        </Link>
      </p>
    </div>
  );
}
