---
description: Convenções de commit Git para este repositório (uso manual ou com @ no chat)
---

Use este texto quando pedir ajuda para **mensagens de commit**, **dividir commits** ou **revisar** mensagens geradas pela IA.

## Regras obrigatórias

1. **Assunto (primeira linha):** formato **`tipo: mensagem`** (ex.: `feat: add establishment registration API client`, `chore: add register establishment query key`).
2. **Sem escopo entre parênteses** por defeito (não usar `feat(register): …` salvo acordo explícito do time neste repo).
3. **Nunca** acrescentar trailers `Co-authored-by: Cursor`, `cursoragent@cursor.com` ou similares de ferramenta.
4. Tipos comuns: `feat`, `fix`, `test`, `chore`, `docs`, `refactor` — alinhados ao `git log` existente.
5. **Depois de criar commits:** rever as mensagens geradas; se aparecer **qualquer trailer** que o projeto não aceite (regra 3 e secção abaixo), **remove-o** antes de push (`git commit --amend` no último, ou `git rebase -i` para reescrever mensagens mais antigas na série).

## Após criar commits (revisão recomendada)

Sempre que termines um ou mais commits (IDE, agente ou terminal):

1. **Inspecciona as mensagens** — por exemplo `git log -n 15 --format=fuller` ou, para o último, `git show -s --format=fuller HEAD`.
2. **Procura trailers** no corpo do commit (linhas após a primeira linha em branco), por exemplo `Co-authored-by:`, `Signed-off-by:` ou outros que a ferramenta possa ter injetado.
3. **Se existirem e forem indesejados** (cumpre a regra 3 ou política do time), **apaga-os**:
   - último commit: `git commit --amend`, remove as linhas de trailer, guarda;
   - commits mais antigos na série: `git rebase -i` e `reword` nos commits afectados.

Isto evita levar trailers para o remoto e mantém o histórico alinhado com as regras do repositório.

## Nota (Cursor / agente)

Se um commit criado a partir do agente vier com `Co-authored-by: Cursor` no objeto Git, isso **não** cumpre a regra 3 — faz parte do passo **“Após criar commits”**: corrige antes do push.

```bash
git commit --amend
```

Apaga as linhas `Co-authored-by: ...` (e outros trailers indesejados), guarda e fecha o editor. Em alternativa, desativa nos **Settings** do Cursor a opção que acrescenta co-autor em commits feitos pelo agente (nome varia com a versão; procura por "co-author" ou "git" nas definições).

## Opcional

- **Corpo:** parágrafos curtos após linha em branco, se o commit precisar de contexto.
- **Granularidade:** preferir **um commit por ficheiro** (ou por mudança mínima coerente) com mensagem específica em vez de um único commit vago.

**Fluxo (um ficheiro de cada vez, ordem lógica para revisão):** regra do projeto em `.cursor/rules/git-commit-flow.mdc`.

## Exemplo bom

```text
feat: add establishment registration API client
```

## Exemplo a evitar

```text
feat(register): add POST client

Co-authored-by: Cursor <cursoragent@cursor.com>
```
