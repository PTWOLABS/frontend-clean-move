# Clean-move – Arquitetura Frontend

## Visão geral

O frontend do **Clean-move** é um projeto **Next.js 16 + TypeScript** com **App Router** e arquitetura **feature-based**.  
O objetivo é manter **domínios bem separados** (`auth`, `user`, `service`) e um núcleo compartilhado (`shared`, `components/ui`) que concentra infraestrutura, design system e utilitários.

Principais blocos:

- **Next.js (App Router)**: roteamento em `src/app`, páginas server/client, otimizações e integração com React 19.
- **TypeScript**: tipagem estática para componentes, hooks, schemas e clientes de API.
- **Arquitetura por features**: cada domínio tem sua própria pasta com `api`, `components`, `hooks`, `schemas`, `types`.
- **React Query**: camada de estado assíncrono para consumo da API REST externa.
- **React Hook Form + Zod**: formulários tipados e validados, integrados ao design system.
- **shadcn-style UI + Tailwind CSS**: componentes reutilizáveis (`Button`, `Input`) e tokens de tema.
- **Tema dark/light**: baseado em `next-themes`, controlando classes Tailwind.
- **Testes (Vitest + React Testing Library + Cypress)**: testes unitários e E2E.
- **Docker**: empacotamento do app para execução em containers.

---

## Organização de pastas

### `src/app`

Responsável pelo **roteamento** e layout de alto nível.

Estrutura relevante:

- `src/app/layout.tsx`
  - Layout raiz da aplicação.
  - Envolve a UI com:
    - `ThemeProvider` (tema dark/light).
    - `AppQueryClientProvider` (React Query).
  - Define o header principal (título Clean-move, toggle de tema).
- `src/app/page.tsx`
  - Página inicial simples com navegação para os domínios:
    - `/login` (auth)
    - `/user` (user)
    - `/servicos` (service)
- `src/app/(public)/login/page.tsx`
  - Rota pública de login.
  - Consome `features/auth` (formulário, schema, mutation de login).
- `src/app/(private)/user/page.tsx`
  - Rota autenticada (conceitualmente) para dados de usuário.
  - Consome `features/user`.
- `src/app/(private)/servicos/page.tsx`
  - Rota autenticada (conceitualmente) para serviços.
  - Consome `features/service`.

### `src/features`

Pasta de **domínios de negócio**. Cada pasta de domínio é uma “feature root”.

Domínios atuais:

- `src/features/auth`
- `src/features/user`
- `src/features/service`

#### Padrão interno de uma feature

Cada domínio deve, idealmente, seguir um padrão de subpastas:

- `api/`
  - Funções de integração com a **API REST externa**.
  - Encapsulam o `httpClient` compartilhado.
  - Exemplos:
    - `auth/api/index.ts`: `login`, `getCurrentUser`.
    - `user/api/index.ts`: `getCurrentUserProfile`.
    - `service/api/index.ts`: `listServicos`.
- `components/`
  - Componentes de UI **específicos do domínio**, compostos a partir de:
    - Componentes de UI base (`src/components/ui`).
    - Hooks do próprio domínio.
  - Exemplos:
    - `auth/components/login-form.tsx`.
    - `user/components/user-summary.tsx`.
    - `service/components/servicos-list.tsx`.
- `hooks/`
  - Hooks React (geralmente `React Query`) focados no domínio.
  - Sempre consomem o módulo `api` da mesma feature.
  - Exemplos:
    - `auth/hooks/use-login.ts`.
    - `user/hooks/use-current-user.ts`.
    - `service/hooks/use-servicos.ts`.
- `schemas/`
  - **Schemas Zod** para validação de formulários e contratos de entrada.
  - Exemplos:
    - `auth/schemas/login-schema.ts`.
  - Futuras features devem criar um schema por caso de uso relevante (ex.: criação/edição de serviço).
- `types/`
  - **Tipagens de domínio**, específicas daquele contexto.
  - Exemplos:
    - `auth/types/index.ts`: `AuthUser`, `LoginPayload`, `LoginResponse`.
    - `user/types/index.ts`: `User`.
    - `service/types/index.ts`: `Servico`.

> **Regra geral**: código que só faz sentido dentro de um domínio fica dentro da feature. Código transversal (reutilizável entre domínios) vai para `src/shared` ou `src/components/ui`.

### `src/shared`

Responsável por **infraestrutura compartilhada**:

- `src/shared/api/httpClient.ts`
  - Cliente REST genérico baseado em `fetch`.
  - Usa `NEXT_PUBLIC_API_BASE_URL` (definido em `.env`).
  - Centraliza:
    - Base URL.
    - Headers padrão (`Content-Type: application/json`).
    - Tratamento de erro (lê JSON ou texto).
- `src/shared/providers/`
  - `theme-provider.tsx`: wrapper em torno do `next-themes`.
  - `query-client-provider.tsx`: inicializa `QueryClient` e React Query Devtools.
- `src/shared/forms/form.tsx`
  - Abstração de formulário em cima de **React Hook Form**.
  - Aceita `schema` opcional (Zod) e configura o `zodResolver` automaticamente.
  - A ideia é **padronizar** criação de formulários nos domínios.
- `src/shared/utils/cn.ts`
  - Utilitário `cn` baseado em `clsx` + `tailwind-merge` para combinar classes.

### `src/components/ui`

Mini **design system** inspirado em shadcn/ui:

- `button.tsx`
  - Componente `Button` com variantes (`default`, `secondary`, `outline`, `ghost`, `link`, `destructive`) e tamanhos.
  - Usa `class-variance-authority` para modelar variantes de estilo.
  - Usa `cn` para mesclar classes.
- `input.tsx`
  - Campo de input genérico com estilos consistentes com o tema Tailwind.

### `src/components`

Componentes compartilhados que não são puramente “primitivas de UI”:

- `src/components/theme-toggle.tsx`
  - Componente que conversa com `next-themes` para alternar entre dark/light.
  - Usa `Button` da UI base.

### Testes e Ferramentas

- `src/test/setup-tests.ts`
  - Configuração global do Vitest + RTL (`@testing-library/jest-dom/vitest`).
- `cypress/`
  - Testes E2E.
  - `cypress/e2e/smoke.cy.ts`: fluxo simples de navegação entre domínios.

---

## Tecnologias e papéis

### Next.js 16 (App Router)

- Framework React para **SSR, SSG, rotas App Router** e otimizações de performance.
- Garante:
  - Rotas em pastas, com suporte a layouts aninhados.
  - Integração com `next/font`, otimização de imagens etc.

Uso no projeto:

- Rotas principais (`/`, `/login`, `/user`, `/servicos`) em `src/app`.
- `layout.tsx` definido como layout raiz, incluindo providers globais.

### TypeScript

- Fornece **tipagem estática** para:
  - Componentes React.
  - Hooks.
  - Contratos de API (types).
  - Schemas (via inferência Zod).

Benefícios:

- Detecção precoce de erros.
- Melhor DX com IntelliSense.

### Tailwind CSS

- Framework de CSS utilitário.
- Configurado em `tailwind.config.ts` e usado em `src/app/globals.css`.
- Tokens de cor e radius são definidos como variáveis CSS (`--background`, `--primary`, etc.) e referenciados por Tailwind (`bg-background`, `text-foreground`).

Uso no projeto:

- Layouts (`flex`, `grid`, espaçamentos).
- Estilos de componente base (`Button`, `Input`).
- Ajustes responsivos e de tema.

### shadcn-style UI (class-variance-authority, tailwind-merge, radix slot)

- Inspirado na stack do shadcn/ui:
  - `class-variance-authority` (CVA) para modelar variantes de componente.
  - `tailwind-merge` e `clsx` para combinação inteligente de classes.
  - `@radix-ui/react-slot` para componentes polimórficos (`asChild`).

Uso no projeto:

- `Button` usa CVA e `asChild`.
- `Input` segue padrões de estilo consistentes com o tema.

### next-themes (Tema dark/light)

- Lib que abstrai o controle de tema através da classe `class` no `html`.
- Permite:
  - `defaultTheme="system"`.
  - Persistência da escolha do usuário (localStorage).

Uso no projeto:

- `ThemeProvider` em `shared/providers/theme-provider.tsx`.
- `ThemeToggle` para alternar entre temas.
- Tailwind configurado com `darkMode: "class"` para responder à classe `dark`.

### React Query (@tanstack/react-query)

- Biblioteca para **estado assíncrono**, cache e sincronização de dados com a API.

Uso no projeto:

- `AppQueryClientProvider` inicializa o `QueryClient`.
- Hooks de domínio:
  - `useLogin` (mutation).
  - `useCurrentUser` (query).
  - `useServicos` (query).
- Responsável por:
  - Cache por `queryKey` (ex.: `["user","me"]`, `["servicos"]`).
  - Estados de loading/erro/dados.

### React Hook Form + Zod

- **React Hook Form**: formulários performáticos com registro de inputs, validação e controle de estado mínimo.
- **Zod**: schemas de validação e inferência de tipos.

Uso no projeto:

- `shared/forms/form.tsx`:
  - Cria um form provider padrão.
  - Integra Zod via `zodResolver(schema)` quando o schema é passado.
- `auth/schemas/login-schema.ts`:
  - Define regras de validação para o login.
- `auth/components/login-form.tsx`:
  - Usa o `Form` compartilhado, o schema Zod, `Input` e `Button`.

### Vitest + React Testing Library

- **Vitest**: test runner moderno com boa integração para projetos Vite/React (aqui usado como runner de testes unitários).
- **React Testing Library**: auxilia a testar componentes via interações de usuário e DOM.

Uso no projeto:

- Configuração em `vitest.config.mjs`:
  - Ambiente `jsdom`.
  - `setupFiles` com `src/test/setup-tests.ts`.

> Observação: versões mais novas do Vitest/Vite podem depender de bindings nativos (`rolldown`) que exigem um ambiente alinhado com a versão do Node. Caso haja erro de binding, ajustar versões ou reinstalar dependências pode ser necessário.

### Cypress

- Framework para testes E2E.

Uso no projeto:

- `cypress.config.ts` com `baseUrl`.
- `cypress/e2e/smoke.cy.ts` validando navegação básica entre domínios.

### Docker / Docker Compose

- `Dockerfile` multi-stage:
  - Stage para instalar deps (`npm ci`).
  - Stage de build (`npm run build`).
  - Stage runner (`npm start`).
- `docker-compose.yml`:
  - Serviço `web` expondo porta 3000.
  - Injeta `NEXT_PUBLIC_API_BASE_URL`.

---

## Como criar novas features seguindo o padrão

Suponha uma nova feature de **agendamentos** (`booking`):

1. Criar pasta do domínio:
   - `src/features/booking/`.
2. Dentro dela, criar subpastas:
   - `api/`
     - `index.ts` com chamadas REST (`getBookings`, `createBooking`, etc.) usando `httpClient`.
   - `types/`
     - Tipos como `Booking`, `CreateBookingPayload`, etc.
   - `schemas/`
     - `create-booking-schema.ts` com Zod.
   - `hooks/`
     - `use-bookings.ts`, `use-create-booking.ts` usando React Query.
   - `components/`
     - `booking-list.tsx`, `booking-form.tsx` usando `Form`, `Input`, `Button` etc.
3. Expor a nova rota em `src/app`:
   - Por exemplo, `src/app/(private)/booking/page.tsx` consumindo `features/booking`.

**Princípio geral**: cada feature deve conter tudo o que é específico daquele domínio (UI, hooks, tipos, schemas, API).  
Infraestrutura, estilos e helpers mais genéricos ficam em `shared` ou `components/ui`.
