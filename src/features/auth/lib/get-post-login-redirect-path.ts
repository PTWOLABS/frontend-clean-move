type OnboardingCompletion = {
  onboardingCompletedAt: string | null;
};

export function getPostLoginRedirectPath({ onboardingCompletedAt }: OnboardingCompletion) {
  console.log(onboardingCompletedAt ? "/dashboard" : "/onboarding");
  return onboardingCompletedAt ? "/dashboard" : "/onboarding";
}
