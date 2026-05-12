export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

/** Resposta de `POST /auth/login`, `POST /auth/google` e `POST /auth/refresh` (DTO da API). */
export type AuthSessionResponse = {
  userId: string;
  accessToken: string;
};

export type GoogleLoginPayload = {
  idToken: string;
};

/** @deprecated Preferir AuthSessionResponse. */
export type LoginResponse = AuthSessionResponse;
