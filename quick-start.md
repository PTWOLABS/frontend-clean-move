# Clean-move – Quick Start

Guia rápido para rodar o frontend do **Clean-move** localmente e entender o mínimo da estrutura.

---

## Pré-requisitos

- **Node.js 20+**
- **npm** (já vem com o Node)
- Opcional:
  - **Docker** e **Docker Compose** (para rodar em container).

---

## Clonar o projeto

```bash
git clone <url-do-repo> clean-move
cd clean-move
```

> Ajuste a URL do repositório conforme onde você hospedar o código.

---

## Instalar dependências

```bash
npm install
```

---

## Configurar variáveis de ambiente

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

2. Edite `.env.local` e configure a URL da API externa:

```bash
NEXT_PUBLIC_API_BASE_URL=https://sua-api.com
```

> Em desenvolvimento, você pode apontar para um mock/local (`http://localhost:3333`, por exemplo).

---

## Rodar em modo desenvolvimento

```bash
npm run dev
```

Abra `http://localhost:3000` no navegador.

Rotas principais:

- `/` – home, com links para os domínios.
- `/login` – domínio **auth** (formulário de login).
- `/user` – domínio **user** (dados do usuário atual).
- `/servicos` – domínio **service** (lista de serviços; rota permanece em PT).

---

## Estrutura mínima que você precisa saber

- `src/app`
  - Define as rotas e o layout principal.
- `src/features/auth`
  - Fluxos de autenticação (login).
- `src/features/user`
  - Dados do usuário.
- `src/features/service`
  - Listagem de serviços.
- `src/shared`
  - Infraestrutura compartilhada (client HTTP, providers, formulários, utils).
- `src/components/ui`
  - Componentes de UI base (botão, input, etc.).

Para começar a mexer:

- Quer alterar a navegação ou layout global? → Veja `src/app/layout.tsx` e `src/app/page.tsx`.
- Quer mudar o formulário de login? → Veja `src/features/auth/components/login-form.tsx`.
- Quer apontar para outra API ou endpoint? → Veja `src/shared/api/httpClient.ts` e `src/features/*/api/index.ts`.

---

## Testes rápidos

### Testes unitários (Vitest)

```bash
npm test
```

> Se houver erro relacionado a bindings nativos (`rolldown`), verifique a versão do Node e/ou reinstale dependências. Isso é de ambiente, não de regra de negócio.

### Testes E2E (Cypress)

1. Com o servidor dev rodando (`npm run dev`):

```bash
npm run cypress:open
```

2. Rode o teste `smoke.cy.ts` para validar a navegação básica.

---

## Rodar com Docker (opcional)

### Build e run direto com Docker

```bash
docker build -t clean-move-web .
docker run -p 3000:3000 --env-file .env.local clean-move-web
```

### Usando Docker Compose

```bash
docker compose up --build
```

O app ficará disponível em `http://localhost:3000`.

