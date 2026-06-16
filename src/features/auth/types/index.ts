export type AuthUser = {
  id: string;
  name: string;
  email: string;
  onboardingCompletedAt: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

/** Resposta de `POST /auth/login`, `POST /auth/google` */
export type AuthSessionResponse = {
  userId: string;
  accessToken: string;
  onboardingCompletedAt: string | null;
};

export type GoogleLoginPayload = {
  idToken: string;
  role: "CUSTOMER" | "ESTABLISHMENT";
};

/** @deprecated Preferir AuthSessionResponse. */
export type LoginResponse = AuthSessionResponse;
