"use client";
import { useState } from "react";
import { OnboardingProgress } from "./onboarding-progress";

const STEPS = ["establishment", "", "", ""];

export function OnboardingForm() {
  const [step, setStep] = useState(1);

  return <OnboardingProgress currentStep={step} totalSteps={STEPS.length} />;
}
