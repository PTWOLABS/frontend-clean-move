/** Sessão inválida: cookie ausente ou refresh falhou (antes de `/auth/me`). */
export class UnauthenticatedError extends Error {
  constructor(message = "Sessão inválida ou expirada.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}
