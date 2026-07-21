import { ApiError } from "@/shared/api/httpClient";

export type ApiErrorFeedback = {
  title: string;
  description: string;
};

export type ApiValidationErrorCode =
  | "REQUIRED"
  | "INVALID_TYPE"
  | "INVALID_FORMAT"
  | "OUT_OF_RANGE"
  | "MIN_ITEMS"
  | "MAX_ITEMS"
  | "INVALID_VALUE";

export type ApiValidationError = {
  field: string;
  code: string;
};

export type ApiErrorFeedbackMap<TCode extends string = string> = Partial<
  Record<TCode, ApiErrorFeedback>
>;

export type ResolveApiErrorFeedbackOptions<TCode extends string = string> = {
  error: unknown;
  idPrefix: string;
  fallback: ApiErrorFeedback;
  feedbackByCode: ApiErrorFeedbackMap<TCode>;
  feedbackByStatus?: Partial<Record<number, ApiErrorFeedback>>;
  validationMessages?: Partial<Record<ApiValidationErrorCode, string>>;
};

export type ResolvedApiErrorFeedback = ApiErrorFeedback & {
  id: string;
  statusCode?: number;
  code?: string;
  validationErrors?: ApiValidationError[];
  fieldErrors?: Record<string, string>;
};

type ParsedApiErrorPayload = {
  code?: string;
  validationErrors: ApiValidationError[];
};

const DEFAULT_VALIDATION_FEEDBACK: ApiErrorFeedback = {
  title: "Revise os dados informados.",
  description: "Corrija os campos destacados antes de continuar.",
};

const DEFAULT_VALIDATION_MESSAGES: Record<ApiValidationErrorCode, string> = {
  REQUIRED: "Campo obrigatório.",
  INVALID_TYPE: "Valor inválido.",
  INVALID_FORMAT: "Formato inválido.",
  OUT_OF_RANGE: "Valor fora do intervalo permitido.",
  MIN_ITEMS: "Informe pelo menos um item.",
  MAX_ITEMS: "Quantidade máxima excedida.",
  INVALID_VALUE: "Valor inválido.",
};

const DEFAULT_STATUS_FEEDBACK: Partial<Record<number, ApiErrorFeedback>> = {
  401: {
    title: "Sua sessão expirou.",
    description: "Atualize a página e faça login novamente para continuar.",
  },
  403: {
    title: "Acesso negado.",
    description: "Seu usuário não tem permissão para realizar esta operação.",
  },
  429: {
    title: "Muitas tentativas.",
    description: "Aguarde alguns instantes antes de tentar novamente.",
  },
  500: {
    title: "Não foi possível concluir a operação.",
    description: "O servidor apresentou uma falha. Tente novamente em alguns instantes.",
  },
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseValidationErrors(value: unknown): ApiValidationError[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((error) => {
    if (!isRecord(error) || !isNonEmptyString(error.field) || !isNonEmptyString(error.code)) {
      return [];
    }

    return [{ field: error.field, code: error.code }];
  });
}

function parseApiErrorPayload(payload: unknown): ParsedApiErrorPayload {
  if (!isRecord(payload)) {
    return { validationErrors: [] };
  }

  return {
    ...(isNonEmptyString(payload.code) ? { code: payload.code } : {}),
    validationErrors: parseValidationErrors(payload.errors),
  };
}

function isKnownValidationErrorCode(code: string): code is ApiValidationErrorCode {
  return Object.hasOwn(DEFAULT_VALIDATION_MESSAGES, code);
}

function getValidationMessage(
  code: string,
  validationMessages?: Partial<Record<ApiValidationErrorCode, string>>,
) {
  if (!isKnownValidationErrorCode(code)) {
    return "Valor inválido.";
  }

  return validationMessages?.[code] ?? DEFAULT_VALIDATION_MESSAGES[code];
}

function getFieldErrors(
  validationErrors: ApiValidationError[],
  validationMessages?: Partial<Record<ApiValidationErrorCode, string>>,
) {
  const fieldErrors = new Map<string, string>();

  for (const validationError of validationErrors) {
    if (!fieldErrors.has(validationError.field)) {
      fieldErrors.set(
        validationError.field,
        getValidationMessage(validationError.code, validationMessages),
      );
    }
  }

  return Object.fromEntries(fieldErrors);
}

export function resolveApiErrorFeedback<TCode extends string = string>({
  error,
  idPrefix,
  fallback,
  feedbackByCode,
  feedbackByStatus,
  validationMessages,
}: ResolveApiErrorFeedbackOptions<TCode>): ResolvedApiErrorFeedback {
  if (!(error instanceof ApiError)) {
    return {
      id: `${idPrefix}-unknown`,
      ...fallback,
    };
  }

  const { code, validationErrors } = parseApiErrorPayload(error.payload);
  const codeFeedback =
    code && Object.hasOwn(feedbackByCode, code) ? feedbackByCode[code as TCode] : undefined;
  const isValidationError = code === "VALIDATION_ERROR";
  const feedback =
    codeFeedback ??
    (isValidationError
      ? DEFAULT_VALIDATION_FEEDBACK
      : (feedbackByStatus?.[error.statusCode] ??
        DEFAULT_STATUS_FEEDBACK[error.statusCode] ??
        fallback));
  const fieldErrors = isValidationError ? getFieldErrors(validationErrors, validationMessages) : {};

  return {
    id: `${idPrefix}-${code ?? error.statusCode}`,
    ...feedback,
    statusCode: error.statusCode,
    ...(code ? { code } : {}),
    ...(isValidationError && validationErrors.length > 0 ? { validationErrors } : {}),
    ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
  };
}
