 # Clean-move

Plataforma de agendamento para lava-rápido (**Clean-move**), focada em experiência do usuário e organização clara por domínios de negócio.

Este repositório contém o **frontend** da solução, alinhado à especificação funcional da *“Plataforma de Agendamento para Lava-Rápido”* (UC-01 a UC-16), disponível em `public/especificacao_funcional_lava_rapido.pdf`.

---

## Ideia do projeto

O Clean-move permite que:

- **Donos de lava-rápido**:
  - Cadastrem seu estabelecimento (UC-01).
  - Configurem catálogo de **serviços** (UC-11, UC-12) e acompanhem indicadores (UC-13).
  - Gerenciem agendamentos e histórico vinculados ao seu negócio (UC-14, UC-15).
- **Consumidores**:
  - Criem conta (UC-02) e façam login (UC-03).
  - Descubram e filtrem estabelecimentos (UC-04).
  - Agendem serviços (UC-14) e acompanhem histórico (UC-15).
  - Gerenciem estabelecimentos **favoritos** (UC-16).

Em cima disso, ainda existem fluxos transversais importantes:

- Esquecimento e redefinição de senha (UC-05, UC-06).
- Atualização de perfil de usuário e estabelecimento (UC-07, UC-08).
- Exclusão de contas/estabelecimentos (UC-09).
- Moderação de serviços (UC-10).

---

## Boas práticas e arquitetura adotada

- **Arquitetura por features (domínios)**  
  Código organizado por domínios de negócio:
  - `auth`: autenticação, login, recuperação de acesso.
  - `user`: dados e perfil do usuário.
  - `service`: serviços ofertados pelos lava-rápidos.
  - Futuras features (ex.: `booking`, `establishment`, `dashboard`, `favorites`) seguirão o mesmo padrão.

- **Padrão interno de cada feature**
  - `api/`: integração com API REST externa (HTTP client compartilhado).
  - `components/`: componentes de UI específicos do domínio.
  - `hooks/`: hooks React (principalmente React Query) encapsulando regras de dados.
  - `schemas/`: validações com Zod (alinhadas aos requisitos funcionais).
  - `types/`: tipos de domínio em TypeScript.

- **Camada compartilhada (`src/shared`)**
  - `api/httpClient.ts`: client REST genérico com base em `NEXT_PUBLIC_API_BASE_URL`.
  - `providers/`: `ThemeProvider` (next-themes) e `AppQueryClientProvider` (React Query).
  - `forms/form.tsx`: wrapper padrão de formulário com RHF + Zod.
  - `utils/cn.ts`: utilitário de classes.

- **Design system e theming**
  - `src/components/ui`: componentes base (`Button`, `Input`) inspirados em shadcn/ui.
  - **Tailwind CSS 4** com tokens de tema (`--background`, `--primary`, etc.).
  - **Tema dark/light** controlado via `next-themes` (classe `dark`).

- **Estado de dados e UX assíncrona**
  - React Query em `src/shared/providers/query-client-provider.tsx` e hooks por domínio.
  - Padrão de estados: loading, erro, vazio e dados atendem aos requisitos transversais (UC-17+).

Mais detalhes técnicos estão em [`arch.md`](./arch.md).  
Para rodar rapidamente o projeto, veja [`quick-start.md`](./quick-start.md).

---

## Tecnologias principais

- **Next.js 16 (App Router) + TypeScript**
- **React 19**
- **React Query (@tanstack/react-query)**
- **React Hook Form + Zod**
- **Tailwind CSS 4 + next-themes + shadcn-style UI**
- **Vitest + React Testing Library + jsdom**
- **Cypress**
- **Docker / Docker Compose**

---

## Arquitetura resumida de pastas

- `src/app`
  - App Router (rotas `/`, `/login`, `/user`, `/servicos`).
  - `layout.tsx` com providers globais.
- `src/features/auth`
  - Infra inicial para fluxos de login e auth (UC-02, UC-03, UC-05, UC-06).
- `src/features/user`
  - Dados do usuário logado (relacionado a UC-02, UC-07).
- `src/features/service`
  - Listagem de serviços integrada à API (parte de UC-10 a UC-12).
- `src/shared`
  - HTTP client, providers, formulários, utilitários.
- `src/components/ui`
  - Componentes base de UI.

Para um guia mais profundo de “como desenvolver uma nova feature”, consulte [`arch.md`](./arch.md).

---

## Estado atual x Casos de uso (To-do)

Status macro do frontend Clean-move em relação à especificação funcional:

- **[x] Planejamento técnico e arquitetura**
  - Stack e padrões definidos.
  - Arquitetura feature-based documentada.
- **[x] Setup de projeto e fundações de UI**
  - Projeto Next inicializado.
  - Tema dark/light, design system base, providers globais e integração API genérica.
- **[ ] Mapeamento completo dos casos de uso UC-01 a UC-16 em features**
  - Apenas exemplos e esqueleto de domínios (`auth`, `user`, `service`) estão iniciados.
- **[ ] Implementação das telas e fluxos detalhados (UI/UX)**
  - **Fase atual**: criação e refinamento de UI/UX no **Figma**, alinhando cada tela aos requisitos do PDF.
  - A implementação de telas seguirá o design aprovado.
- **[ ] Integração fina com backend para todos os UC**
  - Endpoints reais por caso de uso ainda serão conectados.
- **[ ] Cobertura de testes por caso de uso**
  - Infra de testes pronta; será ampliada por fluxo (unitário + E2E) conforme cada UC for implementado.

> Em resumo: **o planejamento técnico está pronto e a base do frontend foi montada**. Agora o foco é **UI/UX no Figma** e, em seguida, a implementação incremental dos casos de uso do Clean-move seguindo a especificação funcional.

