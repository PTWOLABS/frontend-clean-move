# Mapeamento de erros para listagem e PDF de orçamentos

## Objetivo

Exibir feedbacks compreensíveis e específicos para os endpoints já integrados `GET /quotes` e `POST /quotes/:quoteId/pdf`, usando o resolvedor compartilhado que normaliza erros da API.

## Escopo

- Criar um resolvedor tipado para `GET /quotes`, cobrindo `VALIDATION_ERROR`, `FORBIDDEN`, `ESTABLISHMENT_NOT_FOUND` e `INTERNAL_ERROR`.
- Criar um resolvedor tipado para `POST /quotes/:quoteId/pdf`, cobrindo `VALIDATION_ERROR`, `FORBIDDEN`, `ESTABLISHMENT_NOT_FOUND`, `QUOTE_NOT_FOUND` e `INTERNAL_ERROR`.
- Integrar o feedback da listagem na UI que já trata o estado de erro da query.
- Substituir o tratamento manual por status no hook de PDF pelo resolvedor específico e um único toast de erro.
- Cobrir os mapeamentos e fallbacks com testes unitários.

## Arquitetura e fluxo

Cada endpoint terá seu próprio módulo em `src/features/quotes/lib`, seguindo o padrão de `create-quote-error-feedback.ts`. Os módulos declararão a união dos códigos aceitos, o mapa de título/descrição e um fallback próprio da operação. Ambos delegarão o parsing do payload, erros transversais (`401`, `429` e respostas sem `code`) e fallback para `resolveApiErrorFeedback`.

O hook `useListQuotes` continuará responsável apenas pela query. O componente que já identifica `isError` resolverá o erro recebido para renderizar a mensagem. O hook `useGenerateQuotePdf` resolverá o erro em `onError` e chamará `toast.error` uma única vez com título e descrição.

## Feedback esperado

Para listagem, os textos devem orientar a revisar filtros inválidos, informar indisponibilidade de acesso/estabelecimento e sugerir nova tentativa em falhas internas. Para PDF, devem diferenciar identificador inválido, orçamento indisponível, falta de permissão, estabelecimento ausente e falha de geração. Mensagens técnicas do backend não serão exibidas.

## Testes e limites

Os testes validarão que a lista de códigos em cada mapa coincide com o contrato documentado, que cada código gera feedback estável, que `VALIDATION_ERROR` usa o retorno normalizado e que códigos desconhecidos ou erros transversais preservam o comportamento do resolvedor compartilhado. Não haverá alterações nos contratos de API, nas funções de requisição ou no comportamento de download em caso de sucesso.
