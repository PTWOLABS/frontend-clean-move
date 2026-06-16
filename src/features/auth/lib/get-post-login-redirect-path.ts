type OnboardingCompletion = {
  onboardingCompletedAt: string | null;
};

export function getPostLoginRedirectPath({ onboardingCompletedAt }: OnboardingCompletion) {
  return onboardingCompletedAt ? "/dashboard" : "/onboarding";
}
