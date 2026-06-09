"use client";

import { useMemo, useState } from "react";

import { Form } from "@/shared/forms/form";
import { OnboardingProgress } from "./onboarding-progress";
import { CompanyDataStep } from "./steps/company-data-step";
import { ServiceStep } from "./steps/service-step";
import {
  onboardingAppointmentStepSchema,
  onboardingCompanyStepSchema,
  onboardingCustomerVehicleStepSchema,
  onboardingServiceStepSchema,
} from "../schemas/onboarding-schema";
import { StepActions } from "./steps/step-actions";
import { CustomerAndVehicleStep } from "./steps/customer-and-vehicle-step";
import { AppointmentStep } from "./steps/appointment-step";

const stepHeaders = [
  {
    label: "Dados da empresa",
    title: "Vamos conhecer sua empresa",
    description:
      "Informe os dados básicos do seu negócio para personalizar sua experiência no CleanMove.",
  },
  {
    label: "Primeiro serviço",
    title: "Configure seu primeiro serviço",
    description:
      "Cadastre o seu primeiro serviço para iniciar sua operação, como lavagem, polimento ou higienização.",
  },
  {
    label: "Primeiro cliente e veículo",
    title: "Adicione seu primeiro atendimento",
    description: "Cadastre um cliente e um veículo para deixar sua base inicial pronta para uso.",
  },
  {
    label: "Primeiro agendamento",
    title: "Agende o primeiro serviço",
    description:
      "Monte seu primeiro agendamento e veja como sua rotina ficará organizada dentro da plataforma.",
  },
] as const;

const stepSchemas = [
  onboardingCompanyStepSchema,
  onboardingServiceStepSchema,
  onboardingCustomerVehicleStepSchema,
  onboardingAppointmentStepSchema,
] as const;

export function OnboardingForm() {
  const [step, setStep] = useState(1);

  const currentStepIndex = step - 1;
  const currentSchema = stepSchemas[currentStepIndex];
  const lastStep = stepHeaders.length;

  const currentStepHeaders = useMemo(() => {
    return {
      title: stepHeaders[currentStepIndex].title,
      description: stepHeaders[currentStepIndex].description,
    };
  }, [currentStepIndex]);

  function onSubmit(data: unknown) {
    console.log(data);

    if (step < stepHeaders.length) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    // finalizar onboarding aqui
  }

  function onBack() {
    if (step > 1 && step <= lastStep) setStep((currentStep) => currentStep - 1);
  }

  const currentStepContent = useMemo(() => {
    switch (step) {
      case 1:
        return <CompanyDataStep {...currentStepHeaders} />;

      case 2:
        return <ServiceStep {...currentStepHeaders} />;
      case 3:
        return <CustomerAndVehicleStep {...currentStepHeaders} />;

      case 4:
        return <AppointmentStep {...currentStepHeaders} />;

      default:
        return null;
    }
  }, [step, currentStepHeaders]);

  return (
    <div className="space-y-8">
      <OnboardingProgress currentStep={step} totalSteps={stepHeaders.length} />

      <Form onSubmit={onSubmit} schema={currentSchema} className="space-y-6">
        {currentStepContent}
        <StepActions step={step} lastStep={lastStep} backStep={onBack} />
      </Form>
    </div>
  );
}
