"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { StepActions, type OnboardingStepId } from "./steps/step-actions";
import { CustomerAndVehicleStep } from "./steps/customer-and-vehicle-step";
import { AppointmentStep } from "./steps/appointment-step";
import { useCompleteOnboarding } from "../hooks/use-complete-onboarding";
import { OnboardingSummaryDialog } from "./onboarding-summary-dialog";
import { OnboardingMobileSummary } from "./onboarding-mobile-summary";
import { OnboardingStepsCard } from "./onboarding-steps-card";
import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import { useEstablishment } from "@/features/establishment/hooks/use-establishment";
import type { Establishment } from "@/features/establishment/types";

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

const stepIds = [
  "company",
  "service",
  "customerVehicle",
  "appointment",
] as const satisfies readonly OnboardingStepId[];

const onboardingSteps = stepHeaders.map((stepHeader, index) => ({
  ...stepHeader,
  id: stepIds[index],
  schema: stepSchemas[index],
}));

const DEFAULT_CUSTOMER_LABEL = "Cliente não informado";
const DEFAULT_SERVICE_LABEL = "Serviço não informado";
const DEFAULT_VEHICLE_LABEL = "Veículo não informado";

function hasRegisteredCompanyData(establishment: Establishment | undefined) {
  return Boolean(
    establishment?.tradeName?.trim() ||
    establishment?.legalBusinessName?.trim() ||
    establishment?.cnpj?.trim(),
  );
}

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [customerLabel, setCustomerLabel] = useState(DEFAULT_CUSTOMER_LABEL);
  const [serviceLabel, setServiceLabel] = useState(DEFAULT_SERVICE_LABEL);
  const [vehicleLabel, setVehicleLabel] = useState(DEFAULT_VEHICLE_LABEL);
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);

  const { data: user, isLoading: isGettingCurrentUser } = useCurrentUser();
  const establishmentId = user?.establishmentId;
  const {
    data: establishment,
    isLoading: isGettingEstablishment,
    isSuccess: hasLoadedEstablishment,
  } = useEstablishment(establishmentId);

  const isCheckingCompanyData =
    isGettingCurrentUser || (Boolean(establishmentId) && isGettingEstablishment);
  const shouldShowCompanyStep =
    !establishmentId || (hasLoadedEstablishment && !hasRegisteredCompanyData(establishment));
  const availableSteps = onboardingSteps.filter(
    (onboardingStep) => onboardingStep.id !== "company" || shouldShowCompanyStep,
  );

  const currentStepIndex = step - 1;
  const currentStep = availableSteps[currentStepIndex];
  const currentSchema = currentStep?.schema;
  const lastStep = availableSteps.length;

  const { mutateAsync: completeOnboarding, data: completeOnboardingSummaryData } =
    useCompleteOnboarding();

  const currentStepHeaders = {
    title: currentStep?.title,
    description: currentStep?.description,
  };

  async function onSubmit(data: OnboardingSubmitValues) {
    if (currentStep.id === "service") {
      setServiceLabel(data.serviceName ?? DEFAULT_SERVICE_LABEL);
    }

    if (currentStep.id === "customerVehicle") {
      setCustomerLabel(data.customerFullName ?? DEFAULT_CUSTOMER_LABEL);
      setVehicleLabel(data.vehicleModel ?? DEFAULT_VEHICLE_LABEL);
    }

    if (step < lastStep) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    const onboardingPayload = mapOnboardingSubmitToPayload(data);

    try {
      await completeOnboarding(onboardingPayload);
      setOpenSummaryDialog(true);
    } catch {}
  }

  function onBack() {
    if (step > 1 && step <= lastStep) setStep((currentStep) => currentStep - 1);
  }

  function goToStep(stepId: OnboardingStepId) {
    const nextStepIndex = availableSteps.findIndex(
      (onboardingStep) => onboardingStep.id === stepId,
    );

    if (nextStepIndex >= 0) {
      setStep(nextStepIndex + 1);
    }
  }

  function renderCurrentStepContent() {
    switch (currentStep?.id) {
      case "company":
        return <CompanyDataStep {...currentStepHeaders} />;

      case "service":
        return <ServiceStep {...currentStepHeaders} />;

      case "customerVehicle":
        return <CustomerAndVehicleStep {...currentStepHeaders} />;

      case "appointment":
        return (
          <AppointmentStep
            {...currentStepHeaders}
            customerFullName={customerLabel}
            serviceName={serviceLabel}
            vehicleName={vehicleLabel}
            hasCustomer={customerLabel !== DEFAULT_CUSTOMER_LABEL}
            hasService={serviceLabel !== DEFAULT_SERVICE_LABEL}
            hasVehicle={vehicleLabel !== DEFAULT_VEHICLE_LABEL}
            onCustomerClick={() => goToStep("customerVehicle")}
            onServiceClick={() => goToStep("service")}
            onVehicleClick={() => goToStep("customerVehicle")}
          />
        );

      default:
        return null;
    }
  }

  if (isCheckingCompanyData) {
    return <OnboardingFormSkeleton />;
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,25rem)] xl:items-start xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_27rem]">
      <div className="space-y-8">
        <OnboardingProgress currentStep={step} totalSteps={lastStep} />

        <OnboardingMobileSummary
          currentStep={step}
          totalSteps={lastStep}
          customerName={customerLabel}
          serviceName={serviceLabel}
          vehicleName={vehicleLabel}
          hasCustomer={customerLabel !== DEFAULT_CUSTOMER_LABEL}
          hasService={serviceLabel !== DEFAULT_SERVICE_LABEL}
          hasVehicle={vehicleLabel !== DEFAULT_VEHICLE_LABEL}
        />

        <Form onSubmit={onSubmit} schema={currentSchema} className="space-y-6">
          {renderCurrentStepContent()}
          <StepActions
            step={step}
            lastStep={lastStep}
            currentStepId={currentStep?.id}
            backStep={onBack}
          />
        </Form>
      </div>
      <OnboardingStepsCard
        currentStep={step}
        totalSteps={lastStep}
        customerName={customerLabel}
        serviceName={serviceLabel}
        vehicleName={vehicleLabel}
        hasCustomer={customerLabel !== DEFAULT_CUSTOMER_LABEL}
        hasService={serviceLabel !== DEFAULT_SERVICE_LABEL}
        hasVehicle={vehicleLabel !== DEFAULT_VEHICLE_LABEL}
        className="hidden xl:sticky xl:top-6 xl:block xl:self-start"
      />
      <OnboardingSummaryDialog
        shouldShowCompanyStep={shouldShowCompanyStep}
        result={completeOnboardingSummaryData}
        open={openSummaryDialog}
        onOpenChange={setOpenSummaryDialog}
      />
    </div>
  );
}

function OnboardingFormSkeleton() {
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,25rem)] xl:items-start xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_27rem]">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-24 shrink-0" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-5 w-10 shrink-0" />
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-6 shadow-sm">
          <Skeleton className="h-7 w-3/5 max-w-sm" />
          <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
          <div className="mt-8 space-y-5">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>

      <aside className="hidden rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm xl:sticky xl:top-6 xl:block xl:self-start">
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="mt-4 h-5 w-40" />
        <Skeleton className="mt-3 h-4 w-full" />
        <div className="mt-8 space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </aside>
    </div>
  );
}
