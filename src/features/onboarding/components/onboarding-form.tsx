"use client";

import { useMemo, useState } from "react";

import { Form } from "@/shared/forms/form";
import { OnboardingProgress } from "./onboarding-progress";
import { CompanyDataStep } from "./steps/company-data-step";
import { ServiceStep } from "./steps/service-step";
import {
  onboardingCompanyStepSchema,
  onboardingCustomerVehicleStepSchema,
  mapOnboardingSubmitToPayload,
  onboardingSchema,
  onboardingServiceStepSchema,
  OnboardingSubmitValues,
} from "../schemas/onboarding-schema";
import { StepActions } from "./steps/step-actions";
import { CustomerAndVehicleStep } from "./steps/customer-and-vehicle-step";
import { AppointmentStep } from "./steps/appointment-step";
import { useCompleteOnboarding } from "../hooks/use-complete-onboarding";
import { OnboardingSummaryDialog } from "./onboarding-summary-dialog";

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
  onboardingSchema,
] as const;

const DEFAULT_CUSTOMER_LABEL = "Cliente não informado";
const DEFAULT_SERVICE_LABEL = "Serviço não informado";
const DEFAULT_VEHICLE_LABEL = "Veículo não informado";

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [customerLabel, setCustomerLabel] = useState(DEFAULT_CUSTOMER_LABEL);
  const [serviceLabel, setServiceLabel] = useState(DEFAULT_SERVICE_LABEL);
  const [vehicleLabel, setVehicleLabel] = useState(DEFAULT_VEHICLE_LABEL);
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);

  const currentStepIndex = step - 1;
  const currentSchema = stepSchemas[currentStepIndex];
  const lastStep = stepHeaders.length;

  const { mutateAsync: completeOnboarding, data: completeOnboardingSummaryData } =
    useCompleteOnboarding();

  const currentStepHeaders = useMemo(() => {
    return {
      title: stepHeaders[currentStepIndex].title,
      description: stepHeaders[currentStepIndex].description,
    };
  }, [currentStepIndex]);

  async function onSubmit(data: OnboardingSubmitValues) {
    if (step === 2) {
      setServiceLabel(data.serviceName ?? DEFAULT_SERVICE_LABEL);
    }

    if (step === 3) {
      setCustomerLabel(data.customerFullName ?? DEFAULT_CUSTOMER_LABEL);
      setVehicleLabel(data.vehicleModel ?? DEFAULT_VEHICLE_LABEL);
    }

    if (step < stepHeaders.length) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    const onboardingPayload = mapOnboardingSubmitToPayload(data);

    if (step === lastStep) {
      try {
        await completeOnboarding(onboardingPayload);
        setOpenSummaryDialog(true);
      } catch {}
    }
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
        return (
          <AppointmentStep
            {...currentStepHeaders}
            customerFullName={customerLabel}
            serviceName={serviceLabel}
            vehicleName={vehicleLabel}
            hasCustomer={customerLabel !== DEFAULT_CUSTOMER_LABEL}
            hasService={serviceLabel !== DEFAULT_SERVICE_LABEL}
            hasVehicle={vehicleLabel !== DEFAULT_VEHICLE_LABEL}
            onCustomerClick={() => setStep(3)}
            onServiceClick={() => setStep(2)}
            onVehicleClick={() => setStep(3)}
          />
        );

      default:
        return null;
    }
  }, [step, currentStepHeaders, customerLabel, serviceLabel, vehicleLabel]);

  return (
    <div className="space-y-8">
      <OnboardingProgress currentStep={step} totalSteps={stepHeaders.length} />

      <Form onSubmit={onSubmit} schema={currentSchema} className="space-y-6">
        {currentStepContent}
        <StepActions step={step} lastStep={lastStep} backStep={onBack} />
      </Form>
      <OnboardingSummaryDialog
        result={completeOnboardingSummaryData}
        open={openSummaryDialog}
        onOpenChange={setOpenSummaryDialog}
      />
    </div>
  );
}
