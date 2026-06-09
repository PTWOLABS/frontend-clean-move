import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { OnboardingHeader } from "@/features/onboarding/onboarding-header";

export default function Home() {
  return (
    <div className="space-y-6">
      <OnboardingHeader />
      <OnboardingForm />
    </div>
  );
}
