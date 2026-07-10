A API de `/quotes` possui seis endpoints. O contrato específico de erros é `{ statusCode, code, message }`; validações também incluem `errors: [{ field, code }]`.

### `POST /quotes`

| Status | Código                    | Quando ocorre                                                                                                                                                 |
| -----: | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    400 | `VALIDATION_ERROR`        | Body inválido.                                                                                                                                                |
|    400 | `QUOTE_SERVICE_INACTIVE`  | Serviço de catálogo informado está inativo.                                                                                                                   |
|    400 | `INVALID_QUOTE_INPUT`     | Regras comerciais inválidas, como cliente ausente, dados de snapshot inválidos, serviços duplicados/vazios, pagamento inválido ou data de expiração inválida. |
|    403 | `FORBIDDEN`               | Falha de escopo da aplicação.                                                                                                                                 |
|    404 | `ESTABLISHMENT_NOT_FOUND` | Estabelecimento do usuário não encontrado.                                                                                                                    |
|    404 | `CUSTOMER_NOT_FOUND`      | `customerId` não pertence ao estabelecimento ou não existe.                                                                                                   |
|    404 | `VEHICLE_NOT_FOUND`       | `vehicleId` não pertence ao cliente/estabelecimento ou não existe.                                                                                            |
|    404 | `SERVICE_NOT_FOUND`       | Serviço de catálogo não encontrado.                                                                                                                           |
|    404 | `RESOURCE_NOT_FOUND`      | Proprietário do estabelecimento não encontrado.                                                                                                               |
|    500 | `INTERNAL_ERROR`          | Falha interna tratada.                                                                                                                                        |

Para `POST /quotes`, quando o erro for de validação estrutural do body, a resposta é sempre:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "serviceItems.0.priceInCents",
      "code": "INVALID_VALUE"
    }
  ]
}
```

O objeto não inclui `issues`, mensagens do Zod nem valores enviados. `errors` contém todas as falhas encontradas, podendo haver mais de uma entrada para o mesmo campo.

| Campo | Tipo | Valor |
|---|---|---|
| `statusCode` | número | Sempre `400` |
| `code` | string | Sempre `VALIDATION_ERROR` |
| `message` | string | Sempre `Validation failed` |
| `errors` | array | Pelo menos uma falha de campo |
| `errors[].field` | string | Caminho do campo no payload, usando `.` para objetos/arrays |
| `errors[].code` | string | Código normalizado da falha |

Códigos possíveis em `errors[].code`:

| Código | Significado |
|---|---|
| `REQUIRED` | Campo obrigatório não foi enviado. |
| `INVALID_TYPE` | Tipo incompatível, como texto onde era esperado número ou booleano. |
| `INVALID_FORMAT` | UUID, enum ou formato de data inválido. |
| `OUT_OF_RANGE` | Número fora do limite permitido. |
| `MIN_ITEMS` | String ou array vazio/quebrando o mínimo. |
| `MAX_ITEMS` | String ou array acima do máximo. |
| `INVALID_VALUE` | Regra condicional entre campos inválida. |

Exemplo com múltiplos problemas:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "customerId",
      "code": "INVALID_FORMAT"
    },
    {
      "field": "customer",
      "code": "INVALID_VALUE"
    },
    {
      "field": "vehicle.brand",
      "code": "REQUIRED"
    },
    {
      "field": "serviceItems",
      "code": "MIN_ITEMS"
    },
    {
      "field": "paymentOptions.0.method",
      "code": "INVALID_FORMAT"
    }
  ]
}
```

Principais caminhos que podem aparecer em `errors`:

| Área | Caminhos possíveis |
|---|---|
| Cliente | `customerId`, `customer`, `customer.name`, `customer.phone`, `customer.cpfCnpj`, `customer.address`, `customer.address.street`, `customer.address.country`, `customer.address.state`, `customer.address.zipCode`, `customer.address.city`, `customer.address.complement` |
| Veículo | `vehicleId`, `vehicle`, `vehicle.plate`, `vehicle.brand`, `vehicle.model`, `vehicle.color`, `vehicle.year` |
| Serviços | `serviceItems`, `serviceItems.{índice}`, `serviceItems.{índice}.serviceId`, `serviceItems.{índice}.serviceName`, `serviceItems.{índice}.priceInCents`, `serviceItems.{índice}.isCourtesy` |
| Pagamentos | `paymentOptions`, `paymentOptions.{índice}`, `paymentOptions.{índice}.method`, `paymentOptions.{índice}.label`, `paymentOptions.{índice}.installments`, `paymentOptions.{índice}.interestFree`, `paymentOptions.{índice}.discountType`, `paymentOptions.{índice}.discountValue` |
| Demais campos | `description`, `termsAndConditions`, `expiresAt` |

Há três regras condicionais que retornam `INVALID_VALUE`:

| `field` | Regra |
|---|---|
| `customer` | Não pode enviar `customer` junto com `customerId`. |
| `vehicle` | Não pode enviar `vehicle` preenchido junto com `vehicleId`. |
| `serviceItems.{índice}.serviceName` | É obrigatório sem `serviceId`; também não pode ser enviado quando há `serviceId`. |
| `serviceItems.{índice}.priceInCents` | É obrigatório quando não há `serviceId`. |

Importante: erros de regras de negócio após a validação — por exemplo, serviço inativo ou pagamento comercial inválido — também retornam HTTP 400, mas usam outro `code` de topo, como `QUOTE_SERVICE_INACTIVE` ou `INVALID_QUOTE_INPUT`, e não incluem `errors`.

### `GET /quotes`

| Status | Código                    | Quando ocorre                                                                                   |
| -----: | ------------------------- | ----------------------------------------------------------------------------------------------- |
|    400 | `VALIDATION_ERROR`        | Query inválida, como UUID, datas, booleano, paginação, ordenação ou limites de texto inválidos. |
|    403 | `FORBIDDEN`               | Falha de escopo da aplicação.                                                                   |
|    404 | `ESTABLISHMENT_NOT_FOUND` | Estabelecimento do usuário não encontrado.                                                      |
|    500 | `INTERNAL_ERROR`          | Falha interna tratada.                                                                          |

### `GET /quotes/:quoteId`

| Status | Código                    | Quando ocorre                                                        |
| -----: | ------------------------- | -------------------------------------------------------------------- |
|    400 | `VALIDATION_ERROR`        | `quoteId` não é UUID válido.                                         |
|    403 | `FORBIDDEN`               | Falha de escopo da aplicação.                                        |
|    404 | `ESTABLISHMENT_NOT_FOUND` | Estabelecimento do usuário não encontrado.                           |
|    404 | `QUOTE_NOT_FOUND`         | Orçamento não existe ou não pertence ao estabelecimento autenticado. |
|    500 | `INTERNAL_ERROR`          | Falha interna tratada.                                               |

### `GET /quotes/:quoteId/pdf`

| Status | Código                    | Quando ocorre                                                        |
| -----: | ------------------------- | -------------------------------------------------------------------- |
|    400 | `VALIDATION_ERROR`        | `quoteId` não é UUID válido.                                         |
|    403 | `FORBIDDEN`               | Falha de escopo da aplicação.                                        |
|    404 | `ESTABLISHMENT_NOT_FOUND` | Estabelecimento do usuário não encontrado.                           |
|    404 | `QUOTE_NOT_FOUND`         | Orçamento não existe ou não pertence ao estabelecimento autenticado. |
|    500 | `INTERNAL_ERROR`          | Falha interna ou geração do PDF falha.                               |

### `POST /quotes/:quoteId/approve`

| Status | Código                                  | Quando ocorre                                              |
| -----: | --------------------------------------- | ---------------------------------------------------------- |
|    400 | `VALIDATION_ERROR`                      | UUID, `startsAt` ou `endsAt` inválidos.                    |
|    400 | `QUOTE_INVALID_SCHEDULE_INTERVAL`       | `endsAt` é anterior ou igual a `startsAt`.                 |
|    400 | `QUOTE_ALREADY_CONVERTED`               | Orçamento já foi convertido em agendamento.                |
|    400 | `QUOTE_CANNOT_BE_APPROVED_FOR_PROSPECT` | Orçamento ainda não está vinculado a um cliente.           |
|    400 | `INVALID_QUOTE_INPUT`                   | Outra regra de domínio de aprovação inválida.              |
|    403 | `FORBIDDEN`                             | Falha de escopo da aplicação.                              |
|    404 | `ESTABLISHMENT_NOT_FOUND`               | Estabelecimento do usuário não encontrado.                 |
|    404 | `QUOTE_NOT_FOUND`                       | Orçamento não existe ou não pertence ao estabelecimento.   |
|    500 | `INTERNAL_ERROR`                        | Falha na transação, criação ou recuperação do agendamento. |

### `POST /quotes/:quoteId/register-customer`

| Status | Código                              | Quando ocorre                                                                          |
| -----: | ----------------------------------- | -------------------------------------------------------------------------------------- |
|    400 | `VALIDATION_ERROR`                  | UUID ou body inválido, incluindo e-mail e tipos dos campos.                            |
|    400 | `QUOTE_ALREADY_HAS_CUSTOMER`        | Orçamento já está vinculado a um cliente.                                              |
|    400 | `QUOTE_VEHICLE_SNAPSHOT_MISSING`    | Solicitado criar veículo, mas o orçamento não tem snapshot de veículo.                 |
|    400 | `QUOTE_VEHICLE_SNAPSHOT_INCOMPLETE` | Snapshot do veículo não contém marca e modelo.                                         |
|    400 | `QUOTE_CUSTOMER_ADDRESS_INCOMPLETE` | Snapshot de endereço do cliente não possui todos os campos obrigatórios.               |
|    400 | `INVALID_QUOTE_INPUT`               | Dados de cliente inválidos após aplicar os valores do orçamento, como telefone/e-mail. |
|    403 | `FORBIDDEN`                         | Falha de escopo da aplicação.                                                          |
|    404 | `ESTABLISHMENT_NOT_FOUND`           | Estabelecimento do usuário não encontrado.                                             |
|    404 | `QUOTE_NOT_FOUND`                   | Orçamento não existe ou não pertence ao estabelecimento.                               |
|    409 | `CUSTOMER_ALREADY_EXISTS`           | Já existe cliente ativo com o mesmo CPF/CNPJ no estabelecimento.                       |
|    500 | `INTERNAL_ERROR`                    | Falha interna ou transacional.                                                         |

Erros transversais a todos os endpoints:

| Status | Código | Observação                                                                                                                                              |
| -----: | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    401 | —      | Token ausente, inválido, expirado ou sessão inválida. É emitido pelo guard global e não segue o contrato de `code` de quotes.                           |
|    403 | —      | Papel não permitido ou funcionário sem a feature exigida. Também é emitido pelo guard global; o `FORBIDDEN` acima se aplica ao fluxo de escopo interno. |
|    429 | —      | Limite global de 100 requisições por minuto excedido.                                                                                                   |
|    500 | —      | Exceção não tratada fora dos fluxos mapeados pode retornar o formato padrão do Nest, sem `code`.                                                        |

Nos `VALIDATION_ERROR`, os códigos por campo possíveis são: `REQUIRED`, `INVALID_TYPE`, `INVALID_FORMAT`, `OUT_OF_RANGE`, `MIN_ITEMS`, `MAX_ITEMS` e `INVALID_VALUE`.

Baseado nos controllers e mapper em [quote-http-errors.ts](/home/pereira/projetos/api-clean-move/src/infra/http/controllers/quote/quote-http-errors.ts), [quote-zod-validation.pipe.ts](/home/pereira/projetos/api-clean-move/src/infra/http/controllers/quote/quote-zod-validation.pipe.ts) e nos casos de uso de quotes.
