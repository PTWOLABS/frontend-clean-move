# Respostas do endpoint `POST /quotes/{quoteId}/approval-analysis`

Este endpoint analisa se um orçamento pode ser aprovado no estado atual dos recursos vinculados ao estabelecimento. Ele é somente leitura: não cria cliente, veículo, serviço ou agendamento.

```http
POST /quotes/{quoteId}/approval-analysis
Authorization: Bearer <accessToken>
Content-Type: application/json
```

## Body

```ts
type AnalyzeQuoteApprovalBodyDto = {
  startsAt: string;
  endsAt?: string | null;
};
```

Exemplo:

```json
{
  "startsAt": "2026-08-01T10:00:00.000Z",
  "endsAt": "2026-08-01T12:00:00.000Z"
}
```

## Resposta `200 OK`

O endpoint retorna `200` tanto quando o orçamento está pronto para aprovação quanto quando existem resoluções pendentes.

### Tipagem correta de `AnalyzeQuoteApprovalResponseDto`

```ts
type AnalyzeQuoteApprovalResponseDto = {
  analysis: QuoteApprovalAnalysisDto;
};

type QuoteApprovalAnalysisDto = {
  status: "READY" | "REQUIRES_RESOLUTION";
  automaticResolutions: QuoteAutomaticResolutionDto[];
  customer: QuoteCustomerAnalysisDto;
  vehicle: QuoteVehicleAnalysisDto;
  services: QuoteServiceAnalysisDto[];
};

type QuoteAutomaticResolutionDto = {
  resource: "CUSTOMER";
  action: "LINK_EXISTING";
  resourceId: string;
  matchedBy: "CPF_CNPJ";
};

type QuoteCustomerAnalysisDto = {
  status:
    | "RESOLVED"
    | "AUTO_LINK"
    | "CANDIDATES_FOUND"
    | "CREATE_REQUIRED"
    | "LINKED_RESOURCE_DELETED";
  requiresResolution: boolean;
  automaticCustomerId: string | null;
  candidates: QuoteCustomerCandidateDto[];
};

type QuoteCustomerCandidateDto = {
  customerId: string;
  matchedBy: Array<"CPF_CNPJ" | "PHONE" | "EMAIL" | "NAME">;
  conflictingFields: Array<"NAME" | "PHONE" | "EMAIL">;
  advisoryOnly: boolean;
};

type QuoteVehicleAnalysisDto = {
  status:
    | "NONE"
    | "RESOLVED"
    | "CANDIDATE_FOUND"
    | "SNAPSHOT_ONLY"
    | "OWNERSHIP_CONFLICT"
    | "LINKED_RESOURCE_DELETED";
  requiresResolution: boolean;
  candidateVehicleId: string | null;
  candidateCustomerId: string | null;
  allowedActions: Array<
    "LINK_EXISTING" | "CREATE_FROM_SNAPSHOT" | "KEEP_SNAPSHOT_ONLY" | "EDIT_SNAPSHOT_PLATE"
  >;
};

type QuoteServiceAnalysisDto = {
  quoteServiceId: string;
  status:
    | "RESOLVED"
    | "READY_TO_CREATE"
    | "CANDIDATE_FOUND"
    | "LINKED_SERVICE_INACTIVE"
    | "LINKED_SERVICE_DELETED"
    | "LINKED_SERVICE_MISSING";
  requiresResolution: boolean;
  serviceId: string | null;
  candidateServiceId: string | null;
  snapshot: QuoteServiceSnapshotAnalysisDto;
  candidate: QuoteServiceCandidateAnalysisDto | null;
  differences: Array<"NAME" | "CATEGORY" | "DURATION" | "PRICE_SPECIFICATION" | "PRICE">;
  allowedActions: Array<
    "ASSOCIATE_EXISTING" | "KEEP_INACTIVE_LINK" | "RENAME_DETACHED" | "RECREATE_FROM_SNAPSHOT"
  >;
};

type QuoteServiceSnapshotAnalysisDto = {
  name: string;
  priceInCents: number;
  durationInMinutes: number | null;
  categoryId: string | null;
  categoryName: string | null;
  isCourtesy: boolean;
};

type QuoteServiceCandidateAnalysisDto = {
  serviceId: string;
  name: string;
  isActive: boolean;
  priceSpecification: ServicePriceSpecificationDto;
  durationInMinutes: number | null;
  categoryId: string | null;
  categoryName: string | null;
};

type ServicePriceSpecificationDto =
  | {
      type: "FIXED";
      fixedPriceInCents: number;
      minPriceInCents?: never;
      maxPriceInCents?: never;
    }
  | {
      type: "STARTING_AT";
      fixedPriceInCents?: never;
      minPriceInCents: number;
      maxPriceInCents?: never;
    }
  | {
      type: "RANGE";
      fixedPriceInCents?: never;
      minPriceInCents: number;
      maxPriceInCents: number;
    };
```

### Exemplo: orçamento pronto

```json
{
  "analysis": {
    "status": "READY",
    "automaticResolutions": [],
    "customer": {
      "status": "RESOLVED",
      "requiresResolution": false,
      "automaticCustomerId": "7bf3b88f-c1d1-4c2e-80ad-f9e3f3d5d40d",
      "candidates": []
    },
    "vehicle": {
      "status": "NONE",
      "requiresResolution": false,
      "candidateVehicleId": null,
      "candidateCustomerId": null,
      "allowedActions": []
    },
    "services": [
      {
        "quoteServiceId": "b910ff06-c99e-4209-8a07-d56e4bcae36f",
        "status": "RESOLVED",
        "requiresResolution": false,
        "serviceId": "863449cb-1e08-4690-b76e-b23730531bd0",
        "candidateServiceId": "863449cb-1e08-4690-b76e-b23730531bd0",
        "snapshot": {
          "name": "Polimento tecnico",
          "priceInCents": 5000,
          "durationInMinutes": 60,
          "categoryId": null,
          "categoryName": null,
          "isCourtesy": false
        },
        "candidate": {
          "serviceId": "863449cb-1e08-4690-b76e-b23730531bd0",
          "name": "Polimento tecnico",
          "isActive": true,
          "priceSpecification": {
            "type": "FIXED",
            "fixedPriceInCents": 5000
          },
          "durationInMinutes": 60,
          "categoryId": null,
          "categoryName": null
        },
        "differences": [],
        "allowedActions": []
      }
    ]
  }
}
```

### Exemplo: resolução necessária

```json
{
  "analysis": {
    "status": "REQUIRES_RESOLUTION",
    "automaticResolutions": [],
    "customer": {
      "status": "CANDIDATES_FOUND",
      "requiresResolution": true,
      "automaticCustomerId": null,
      "candidates": [
        {
          "customerId": "7bf3b88f-c1d1-4c2e-80ad-f9e3f3d5d40d",
          "matchedBy": ["PHONE", "EMAIL"],
          "conflictingFields": ["NAME"],
          "advisoryOnly": false
        }
      ]
    },
    "vehicle": {
      "status": "SNAPSHOT_ONLY",
      "requiresResolution": true,
      "candidateVehicleId": null,
      "candidateCustomerId": null,
      "allowedActions": ["CREATE_FROM_SNAPSHOT", "KEEP_SNAPSHOT_ONLY"]
    },
    "services": [
      {
        "quoteServiceId": "b910ff06-c99e-4209-8a07-d56e4bcae36f",
        "status": "CANDIDATE_FOUND",
        "requiresResolution": true,
        "serviceId": null,
        "candidateServiceId": "863449cb-1e08-4690-b76e-b23730531bd0",
        "snapshot": {
          "name": "Polimento tecnico",
          "priceInCents": 6000,
          "durationInMinutes": null,
          "categoryId": null,
          "categoryName": null,
          "isCourtesy": false
        },
        "candidate": {
          "serviceId": "863449cb-1e08-4690-b76e-b23730531bd0",
          "name": "Polimento tecnico",
          "isActive": true,
          "priceSpecification": {
            "type": "FIXED",
            "fixedPriceInCents": 5000
          },
          "durationInMinutes": null,
          "categoryId": null,
          "categoryName": null
        },
        "differences": ["PRICE"],
        "allowedActions": ["ASSOCIATE_EXISTING", "RENAME_DETACHED"]
      }
    ]
  }
}
```

## Respostas de erro

### `400 Bad Request` - `VALIDATION_ERROR`

Ocorre quando o `quoteId` ou o body não passam na validação.

Exemplo: `startsAt` ausente.

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "startsAt",
      "code": "REQUIRED"
    }
  ]
}
```

Exemplo: `quoteId` inválido.

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "",
      "code": "INVALID_FORMAT"
    }
  ]
}
```

Nota: no contrato atual, a validação do parâmetro recebe apenas o valor bruto de `quoteId`; por isso `field` pode vir como string vazia.

### `400 Bad Request` - `QUOTE_INVALID_SCHEDULE_INTERVAL`

Ocorre quando `endsAt` é menor ou igual a `startsAt`.

```json
{
  "statusCode": 400,
  "code": "QUOTE_INVALID_SCHEDULE_INTERVAL",
  "message": "endsAt must be greater than startsAt."
}
```

### `400 Bad Request` - `QUOTE_ALREADY_CONVERTED`

Ocorre quando o orçamento já foi convertido em agendamento.

```json
{
  "statusCode": 400,
  "code": "QUOTE_ALREADY_CONVERTED",
  "message": "Quote is already converted."
}
```

### `401 Unauthorized`

Ocorre quando a autenticação falha antes do controller.

Token ausente:

```json
{
  "message": "Missing access token.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Token inválido:

```json
{
  "message": "Invalid access token.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Sessão inválida, expirada ou revogada:

```json
{
  "message": "Invalid or expired session.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### `403 Forbidden`

Ocorre quando o usuário autenticado não tem uma role permitida ou quando um funcionário não possui a feature `approve:quotes`.

Formato padrão dos guards:

```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

Formato mapeado por `throwQuoteHttpError`, caso o caso de uso retorne `NotAllowedError`:

```json
{
  "statusCode": 403,
  "code": "FORBIDDEN",
  "message": "Not allowed."
}
```

### `404 Not Found` - `QUOTE_NOT_FOUND`

Ocorre quando o orçamento não existe ou não pertence ao estabelecimento do usuário autenticado.

```json
{
  "statusCode": 404,
  "code": "QUOTE_NOT_FOUND",
  "message": "Resource not found: quote."
}
```

### `404 Not Found` - `ESTABLISHMENT_NOT_FOUND`

Ocorre quando não é possível resolver o estabelecimento do usuário autenticado.

```json
{
  "statusCode": 404,
  "code": "ESTABLISHMENT_NOT_FOUND",
  "message": "Resource not found: establishment."
}
```

### `500 Internal Server Error`

Formato mapeado por `throwQuoteHttpError`:

```json
{
  "statusCode": 500,
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred."
}
```

Formato padrão do Nest para exceções inesperadas fora do mapeamento:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Códigos não esperados neste endpoint

Este endpoint não recebe decisões de resolução e não escreve no banco. Portanto, os códigos abaixo pertencem ao fluxo de aprovação ou registro, mas não são esperados em `POST /quotes/{quoteId}/approval-analysis`:

- `QUOTE_APPROVAL_RESOLUTION_REQUIRED`
- `QUOTE_APPROVAL_CONFLICTS_CHANGED`
- `QUOTE_INVALID_RESOLUTION_ACTION`
- `QUOTE_SERVICE_NAME_UNAVAILABLE`
- `CUSTOMER_ALREADY_EXISTS`
- `RESOURCE_ALREADY_EXISTS`
