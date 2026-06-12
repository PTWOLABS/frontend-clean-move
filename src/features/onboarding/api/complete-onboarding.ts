import { httpClient } from "@/shared/api/httpClient";
import { OnboardingDTO, OnboardingPayload } from "../types/onboarding-types";

export async function completeOnboarding(body: OnboardingPayload) {
  return await httpClient<OnboardingDTO>("/onboarding", {
    body,
    method: "POST",
  });
}
