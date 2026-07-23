# POST /quotes/:quoteId/approve - respostas possiveis

Este endpoint aprova um orcamento e cria um agendamento. Em caso de sucesso,
retorna `201 Created` com o agendamento criado e o orcamento convertido. Em
caso de erro de negocio de quote, o corpo segue o formato:

```json
{
  "statusCode": 400,
  "code": "SOME_ERROR_CODE",
  "message": "Human readable message"
}
```

Alguns erros podem incluir `errors` ou `analysis`, conforme descrito abaixo.

## Resumo por status

| Status                      | Quando acontece                                                                                         | Formato principal                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `201 Created`               | Orcamento aprovado e agendamento criado.                                                                | `{ "appointment": AppointmentItem, "quote": QuoteItem }` |
| `400 Bad Request`           | Payload invalido, intervalo invalido, quote ja convertida, resolucao invalida ou snapshot insuficiente. | `QuoteErrorResponse`                                     |
| `401 Unauthorized`          | Token ausente, invalido, expirado ou sessao invalida.                                                   | Erro padrao do NestJS                                    |
| `403 Forbidden`             | Usuario autenticado sem role/feature exigida, ou regra de dominio negou acesso.                         | Erro padrao do NestJS ou `QuoteErrorResponse`            |
| `404 Not Found`             | Quote, estabelecimento ou dependencia do agendamento nao encontrada no escopo atual.                    | `QuoteErrorResponse`                                     |
| `409 Conflict`              | Resolucao obrigatoria ausente ou conflitos mudaram desde a analise.                                     | `QuoteErrorResponse` com `analysis`                      |
| `500 Internal Server Error` | Falha inesperada.                                                                                       | `QuoteErrorResponse`                                     |

## 201 Created

Resposta de sucesso:

```json
{
  "appointment": {
    "id": "b751a24b-d854-4d6c-b1f8-eae7c18c0a27",
    "establishmentId": "51ff2a3e-b0c2-4d87-8d3c-795a4df9ce1f",
    "customerId": "508c65c8-0a36-4681-af56-77a80e427846",
    "customer": {
      "fullName": "Cliente Exemplo",
      "currentResourceStatus": "UNCHANGED"
    },
    "vehicleId": "7bf3b88f-c1d1-4c2e-80ad-f9e3f3d5d40d",
    "services": [
      {
        "id": "2c0c7644-81d8-4e01-aec4-49cc7c0a4dd3",
        "name": "Lavagem detalhada",
        "category": {
          "id": "2608565d-6e90-4801-8d8a-2781959f76a5",
          "name": "Estetica"
        },
        "durationInMinutes": 120,
        "priceInCents": 45000,
        "currentResourceStatus": "UNCHANGED"
      }
    ],
    "vehicle": {
      "plate": "ABC1D23",
      "brand": "Honda",
      "model": "Civic",
      "color": "Prata",
      "year": 2024,
      "displayName": "Honda Civic 2024",
      "currentResourceStatus": "UNCHANGED"
    },
    "startsAt": "2026-08-01T10:00:00.000Z",
    "endsAt": "2026-08-01T12:00:00.000Z",
    "description": null,
    "discountInCents": null,
    "status": "SCHEDULED",
    "createdAt": "2026-07-21T12:00:00.000Z",
    "updatedAt": "2026-07-21T12:00:00.000Z",
    "doneAt": null,
    "cancelledAt": null
  },
  "quote": {
    "id": "0c2e66a1-cbb9-4d2d-81e3-05ac234d0d9f",
    "establishmentId": "51ff2a3e-b0c2-4d87-8d3c-795a4df9ce1f",
    "customerId": "508c65c8-0a36-4681-af56-77a80e427846",
    "vehicleId": "7bf3b88f-c1d1-4c2e-80ad-f9e3f3d5d40d",
    "convertedAppointmentId": "b751a24b-d854-4d6c-b1f8-eae7c18c0a27",
    "convertedAt": "2026-07-21T12:00:00.000Z",
    "establishment": {
      "name": "Clean Move",
      "legalBusinessName": "Clean Move LTDA",
      "cnpj": "12345678000199",
      "address": null,
      "bannerImageUrl": null
    },
    "customer": {
      "name": "Cliente Exemplo",
      "phone": "11999999999",
      "cpfCnpj": null,
      "address": null
    },
    "vehicle": {
      "plate": "ABC1D23",
      "brand": "Honda",
      "model": "Civic",
      "color": "Prata",
      "year": 2024
    },
    "services": [
      {
        "id": "2c0c7644-81d8-4e01-aec4-49cc7c0a4dd3",
        "name": "Lavagem detalhada",
        "category": {
          "id": "2608565d-6e90-4801-8d8a-2781959f76a5",
          "name": "Estetica"
        },
        "durationInMinutes": 120,
        "priceInCents": 45000,
        "isCourtesy": false
      }
    ],
    "paymentOptions": [
      {
        "method": "PIX",
        "label": "Pix",
        "installments": 1,
        "interestFree": true,
        "discountType": null,
        "discountValue": null,
        "totalInCents": 45000
      }
    ],
    "subtotalInCents": 45000,
    "totalCourtesyValueInCents": 0,
    "description": null,
    "termsAndConditions": null,
    "expiresAt": null,
    "createdAt": "2026-07-20T12:00:00.000Z",
    "updatedAt": "2026-07-21T12:00:00.000Z"
  }
}
```

### Campos de appointment

`appointment` contem:

- `id`, `establishmentId`, `customerId`: UUIDs.
- `customer.fullName`: nome do cliente salvo no snapshot do agendamento.
- `customer.currentResourceStatus`: status atual do recurso de cliente
  (`UNCHANGED`, `UPDATED`, `DELETED`).
- `vehicleId`: UUID ou `null`.
- `vehicle`: objeto com `plate`, `brand`, `model`, `color`, `year`,
  `displayName` e `currentResourceStatus`, ou `null`.
- `services[]`: servicos agendados, com `id`, `name`, `category`,
  `durationInMinutes`, `priceInCents` e `currentResourceStatus`.
- `startsAt`, `endsAt`, `createdAt`, `updatedAt`, `doneAt`, `cancelledAt`:
  strings ISO quando presentes; campos nullable podem ser `null`.
- `description`: string ou `null`.
- `discountInCents`: numero ou `null`.
- `status`: status do agendamento (`SCHEDULED`, `DONE`, `CANCELLED`).

### Campos de quote

`quote` contem:

- `id`, `establishmentId`: UUIDs.
- `customerId`, `vehicleId`, `convertedAppointmentId`: UUID ou `null`.
- `convertedAt`: string ISO quando aprovado.
- `establishment`: snapshot do estabelecimento.
- `customer`: snapshot do cliente/prospect.
- `vehicle`: snapshot do veiculo ou `null`.
- `services[]`: snapshots dos servicos do orcamento.
- `paymentOptions[]`: opcoes de pagamento do orcamento.
- `subtotalInCents`, `totalCourtesyValueInCents`: valores inteiros em centavos.
- `description`, `termsAndConditions`, `expiresAt`: string ou `null`.
- `createdAt`, `updatedAt`: strings ISO.

## 400 Bad Request

### VALIDATION_ERROR

Retornado quando `quoteId` ou o body nao passa no schema Zod do endpoint.

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

Codigos possiveis em `errors[].code`:

- `REQUIRED`
- `INVALID_TYPE`
- `INVALID_FORMAT`
- `OUT_OF_RANGE`
- `MIN_ITEMS`
- `MAX_ITEMS`
- `INVALID_VALUE`

Exemplos de campos:

- `""`: erro no parametro `quoteId`, quando o UUID da rota e invalido.
- `startsAt`
- `endsAt`
- `customerResolution.action`
- `customerResolution.customerId`
- `customerResolution.email`
- `vehicleResolution.action`
- `vehicleResolution.vehicleId`
- `serviceResolutions`
- `serviceResolutions.0.quoteServiceId`
- `serviceResolutions.0.serviceId`
- `serviceResolutions.0.serviceName`

### QUOTE_INVALID_SCHEDULE_INTERVAL

`endsAt` foi enviado menor ou igual a `startsAt`.

```json
{
  "statusCode": 400,
  "code": "QUOTE_INVALID_SCHEDULE_INTERVAL",
  "message": "endsAt must be greater than startsAt."
}
```

### QUOTE_ALREADY_CONVERTED

O orcamento ja possui `convertedAppointmentId` ou `convertedAt`.

```json
{
  "statusCode": 400,
  "code": "QUOTE_ALREADY_CONVERTED",
  "message": "Quote is already converted."
}
```

### QUOTE_INVALID_RESOLUTION_ACTION

A resolucao enviada nao se aplica ao conflito atual, aponta para um alvo
invalido, repete um `quoteServiceId` ou referencia um item que nao existe na
analise atual.

```json
{
  "statusCode": 400,
  "code": "QUOTE_INVALID_RESOLUTION_ACTION",
  "message": "Quote service resolution action is not applicable."
}
```

### QUOTE_SERVICE_NAME_UNAVAILABLE

O approve tentou criar ou renomear um servico para um nome ja existente no
catalogo ativo do estabelecimento.

```json
{
  "statusCode": 400,
  "code": "QUOTE_SERVICE_NAME_UNAVAILABLE",
  "message": "Service name is unavailable."
}
```

### QUOTE_DUPLICATE_SERVICE_RESOLUTION

Pode ser retornado por invariantes do aggregate quando ha tentativa de aplicar
resolucoes duplicadas para servicos do orcamento.

```json
{
  "statusCode": 400,
  "code": "QUOTE_DUPLICATE_SERVICE_RESOLUTION",
  "message": "Duplicate quote service resolution."
}
```

### QUOTE_SERVICE_ITEM_NOT_FOUND

Pode ocorrer se, no momento da conversao, algum item de servico do orcamento
nao estiver associado a um servico de catalogo.

```json
{
  "statusCode": 400,
  "code": "QUOTE_SERVICE_ITEM_NOT_FOUND",
  "message": "Quote services must be linked before conversion."
}
```

### QUOTE_CANNOT_BE_APPROVED_FOR_PROSPECT

Pode ocorrer se a conversao chegar sem o orcamento estar vinculado a um
cliente.

```json
{
  "statusCode": 400,
  "code": "QUOTE_CANNOT_BE_APPROVED_FOR_PROSPECT",
  "message": "Quote must be linked to a customer before conversion."
}
```

### QUOTE_VEHICLE_SNAPSHOT_MISSING

O payload pediu `CREATE_FROM_SNAPSHOT`, mas o orcamento nao tem snapshot de
veiculo.

```json
{
  "statusCode": 400,
  "code": "QUOTE_VEHICLE_SNAPSHOT_MISSING",
  "message": "Quote has no vehicle snapshot."
}
```

### QUOTE_VEHICLE_SNAPSHOT_INCOMPLETE

O payload pediu `CREATE_FROM_SNAPSHOT`, mas o snapshot do veiculo nao tem
`brand` e/ou `model`.

```json
{
  "statusCode": 400,
  "code": "QUOTE_VEHICLE_SNAPSHOT_INCOMPLETE",
  "message": "Quote vehicle snapshot must include brand and model."
}
```

### QUOTE_CUSTOMER_ADDRESS_INCOMPLETE

O approve tentou criar um cliente a partir do snapshot, mas o endereco do
snapshot esta incompleto.

```json
{
  "statusCode": 400,
  "code": "QUOTE_CUSTOMER_ADDRESS_INCOMPLETE",
  "message": "Quote customer address is incomplete."
}
```

### INVALID_QUOTE_INPUT

Codigo generico para violacoes de invariantes de quote que nao tenham um codigo
mais especifico.

```json
{
  "statusCode": 400,
  "code": "INVALID_QUOTE_INPUT",
  "message": "Invalid quote input."
}
```

## 401 Unauthorized

Vem do guard de sessao, antes do controller. O formato e o erro padrao do
NestJS:

```json
{
  "message": "Missing access token.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Mensagens possiveis:

- `Missing access token.`
- `Invalid access token.`
- `Invalid or expired session.`

## 403 Forbidden

### Sem role/feature exigida

Quando o usuario autenticado nao possui role `ESTABLISHMENT`/`EMPLOYEE`, ou o
employee nao possui a feature `approve:quotes`, o erro vem dos guards globais:

```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### FORBIDDEN

Quando uma regra de dominio retorna `NotAllowedError`, o formato segue
`QuoteErrorResponse`:

```json
{
  "statusCode": 403,
  "code": "FORBIDDEN",
  "message": "Not allowed."
}
```

## 404 Not Found

O endpoint retorna 404 quando a quote nao existe no estabelecimento do usuario
ou quando uma dependencia necessaria para converter o orcamento nao esta mais
disponivel.

### QUOTE_NOT_FOUND

Tambem cobre isolamento por estabelecimento: uma quote de outro
estabelecimento aparece como nao encontrada.

```json
{
  "statusCode": 404,
  "code": "QUOTE_NOT_FOUND",
  "message": "Resource not found: quote."
}
```

### ESTABLISHMENT_NOT_FOUND

```json
{
  "statusCode": 404,
  "code": "ESTABLISHMENT_NOT_FOUND",
  "message": "Resource not found: establishment."
}
```

### CUSTOMER_NOT_FOUND

Pode ocorrer se o cliente vinculado desaparecer ou for deletado entre a analise
e a conversao.

```json
{
  "statusCode": 404,
  "code": "CUSTOMER_NOT_FOUND",
  "message": "Resource not found: customer."
}
```

### VEHICLE_NOT_FOUND

Pode ocorrer se o veiculo vinculado desaparecer, for deletado ou deixar de
pertencer ao cliente resolvido antes da conversao.

```json
{
  "statusCode": 404,
  "code": "VEHICLE_NOT_FOUND",
  "message": "Resource not found: vehicle."
}
```

### SERVICE_NOT_FOUND

Fallback mapeado para dependencia de servico nao encontrada.

```json
{
  "statusCode": 404,
  "code": "SERVICE_NOT_FOUND",
  "message": "Resource not found: service."
}
```

### RESOURCE_NOT_FOUND

Fallback para recurso nao mapeado.

```json
{
  "statusCode": 404,
  "code": "RESOURCE_NOT_FOUND",
  "message": "Resource not found."
}
```

## 409 Conflict

Os conflitos de approval retornam o corpo de erro com `analysis`. Essa analise
tem o mesmo formato do retorno de `POST /quotes/:quoteId/approval-analysis`.

### QUOTE_APPROVAL_RESOLUTION_REQUIRED

Faltou enviar uma resolucao exigida pela analise atual.

```json
{
  "statusCode": 409,
  "code": "QUOTE_APPROVAL_RESOLUTION_REQUIRED",
  "message": "Quote approval requires resource resolution.",
  "analysis": {
    "status": "REQUIRES_RESOLUTION",
    "automaticResolutions": [],
    "customer": {
      "status": "CANDIDATES_FOUND",
      "requiresResolution": true,
      "automaticCustomerId": null,
      "candidates": [
        {
          "customerId": "508c65c8-0a36-4681-af56-77a80e427846",
          "matchedBy": ["PHONE", "EMAIL"],
          "conflictingFields": ["NAME"],
          "advisoryOnly": false
        }
      ]
    },
    "vehicle": {
      "status": "NONE",
      "requiresResolution": false,
      "candidateVehicleId": null,
      "candidateCustomerId": null,
      "allowedActions": []
    },
    "services": []
  }
}
```

### QUOTE_APPROVAL_CONFLICTS_CHANGED

As resolucoes enviadas foram baseadas em uma analise desatualizada. Refaca
`POST /quotes/:quoteId/approval-analysis` e envie um novo payload de approve.

```json
{
  "statusCode": 409,
  "code": "QUOTE_APPROVAL_CONFLICTS_CHANGED",
  "message": "Quote approval conflicts changed.",
  "analysis": {
    "status": "REQUIRES_RESOLUTION",
    "automaticResolutions": [],
    "customer": {
      "status": "RESOLVED",
      "requiresResolution": false,
      "automaticCustomerId": null,
      "candidates": []
    },
    "vehicle": {
      "status": "SNAPSHOT_ONLY",
      "requiresResolution": true,
      "candidateVehicleId": null,
      "candidateCustomerId": null,
      "allowedActions": ["CREATE_FROM_SNAPSHOT", "KEEP_SNAPSHOT_ONLY"]
    },
    "services": []
  }
}
```

### Formato de analysis

```json
{
  "status": "READY",
  "automaticResolutions": [
    {
      "resource": "CUSTOMER",
      "action": "LINK_EXISTING",
      "resourceId": "508c65c8-0a36-4681-af56-77a80e427846",
      "matchedBy": "CPF_CNPJ"
    }
  ],
  "customer": {
    "status": "AUTO_LINK",
    "requiresResolution": false,
    "automaticCustomerId": "508c65c8-0a36-4681-af56-77a80e427846",
    "candidates": []
  },
  "vehicle": {
    "status": "CANDIDATE_FOUND",
    "requiresResolution": true,
    "candidateVehicleId": "7bf3b88f-c1d1-4c2e-80ad-f9e3f3d5d40d",
    "candidateCustomerId": "508c65c8-0a36-4681-af56-77a80e427846",
    "allowedActions": ["LINK_EXISTING", "KEEP_SNAPSHOT_ONLY"]
  },
  "services": [
    {
      "quoteServiceId": "3df8bd2a-4689-4e54-91fb-55d88dc178d1",
      "status": "CANDIDATE_FOUND",
      "requiresResolution": true,
      "serviceId": null,
      "candidateServiceId": "2c0c7644-81d8-4e01-aec4-49cc7c0a4dd3",
      "snapshot": {
        "name": "Polimento",
        "priceInCents": 50000,
        "durationInMinutes": 60,
        "categoryId": null,
        "categoryName": null,
        "isCourtesy": false
      },
      "candidate": {
        "serviceId": "2c0c7644-81d8-4e01-aec4-49cc7c0a4dd3",
        "name": "Polimento",
        "isActive": true,
        "priceSpecification": {
          "type": "FIXED",
          "fixedPriceInCents": 50000
        },
        "durationInMinutes": 60,
        "categoryId": null,
        "categoryName": null
      },
      "differences": [],
      "allowedActions": ["ASSOCIATE_EXISTING", "RENAME_DETACHED"]
    }
  ]
}
```

Valores possiveis:

- `analysis.status`: `READY`, `REQUIRES_RESOLUTION`.
- `customer.status`: `RESOLVED`, `AUTO_LINK`, `CANDIDATES_FOUND`,
  `CREATE_REQUIRED`, `LINKED_RESOURCE_DELETED`.
- `customer.candidates[].matchedBy`: `CPF_CNPJ`, `PHONE`, `EMAIL`, `NAME`.
- `customer.candidates[].conflictingFields`: `NAME`, `PHONE`, `EMAIL`.
- `vehicle.status`: `NONE`, `RESOLVED`, `CANDIDATE_FOUND`, `SNAPSHOT_ONLY`,
  `OWNERSHIP_CONFLICT`, `LINKED_RESOURCE_DELETED`.
- `vehicle.allowedActions`: `LINK_EXISTING`, `CREATE_FROM_SNAPSHOT`,
  `KEEP_SNAPSHOT_ONLY`, `EDIT_SNAPSHOT_PLATE`.
- `services[].status`: `RESOLVED`, `READY_TO_CREATE`, `CANDIDATE_FOUND`,
  `LINKED_SERVICE_INACTIVE`, `LINKED_SERVICE_DELETED`,
  `LINKED_SERVICE_MISSING`.
- `services[].differences`: `NAME`, `CATEGORY`, `DURATION`,
  `PRICE_SPECIFICATION`, `PRICE`.
- `services[].allowedActions`: `ASSOCIATE_EXISTING`, `KEEP_INACTIVE_LINK`,
  `RENAME_DETACHED`, `RECREATE_FROM_SNAPSHOT`.
- `candidate.priceSpecification.type`: `FIXED`, `STARTING_AT`, `RANGE`.

## 500 Internal Server Error

Retornado para falhas inesperadas.

```json
{
  "statusCode": 500,
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred."
}
```
