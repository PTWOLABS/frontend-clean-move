import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import { OnboardingHeader } from "@/features/onboarding/components/onboarding-header";

export default function Home() {
  return (
    <div className="space-y-6">
      <OnboardingHeader />
      <OnboardingForm />
    </div>
  );
}
