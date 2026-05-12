---
description: Convenções de commit Git para este repositório (uso manual ou com @ no chat)
---

Use este texto quando pedir ajuda para **mensagens de commit**, **dividir commits** ou **revisar** mensagens geradas pela IA.

## Regras obrigatórias

1. **Assunto (primeira linha):** formato **`tipo: mensagem`** (ex.: `feat: add establishment registration API client`, `chore: add register establishment query key`).
2. **Sem escopo entre parênteses** por defeito (não usar `feat(register): …` salvo acordo explícito do time neste repo).
3. **Nunca** acrescentar trailers `Co-authored-by: Cursor`, `cursoragent@cursor.com` ou similares de ferramenta.
4. Tipos comuns: `feat`, `fix`, `test`, `chore`, `docs`, `refactor` — alinhados ao `git log` existente.

## Opcional

- **Corpo:** parágrafos curtos após linha em branco, se o commit precisar de contexto.
- **Granularidade:** preferir **um commit por ficheiro** (ou por mudança mínima coerente) com mensagem específica em vez de um único commit vago.

## Exemplo bom

```text
feat: add establishment registration API client
```

## Exemplo a evitar

```text
feat(register): add POST client

Co-authored-by: Cursor <cursoragent@cursor.com>
```
