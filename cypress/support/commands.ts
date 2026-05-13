/// <reference types="cypress" />

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Stub the auth/login endpoint with a custom status and body.
       * Returns the alias `@loginRequest` for `cy.wait` calls.
       */
      stubLogin(options?: {
        status?: number;
        body?: Record<string, unknown>;
        alias?: string;
      }): Chainable<void>;

      /**
       * Substitui o script GIS da Google por um mock que chama o callback com JWT fictício.
       * Deve ser chamado antes de `cy.visit` na página de login.
       */
      stubGoogleIdentityScript(): Chainable<void>;

      /**
       * Stub do POST /auth/google (alias `@googleLoginRequest`).
       */
      stubGoogleLogin(options?: {
        status?: number;
        body?: Record<string, unknown>;
        alias?: string;
      }): Chainable<void>;

      /** Stub the BrasilAPI CNPJ lookup endpoint. */
      stubCnpjLookup(options?: {
        status?: number;
        body?: Record<string, unknown> | null;
        alias?: string;
      }): Chainable<void>;

      /** Stub the ViaCEP lookup endpoint. */
      stubZipCodeLookup(options?: {
        status?: number;
        body?: Record<string, unknown> | null;
        alias?: string;
      }): Chainable<void>;

      /** Fill the account step with default valid values. */
      fillAccountStep(values?: Partial<AccountStepValues>): Chainable<void>;
    }
  }
}

type AccountStepValues = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

const defaultAccount: AccountStepValues = {
  fullName: "João da Silva",
  phone: "11999991234",
  email: "joao@email.com",
  password: "supersenha",
};

/** Corpo de `GET /user/me` para stubs E2E (alinhado ao contrato da API). */
function buildUserMeResponse(overrides: { id?: string; name?: string; email?: string } = {}) {
  const id = overrides.id ?? "1";
  const name = overrides.name ?? "João da Silva";
  const email = overrides.email ?? "joao@email.com";
  return {
    user: {
      id,
      name,
      email,
      role: "CUSTOMER",
      phone: "",
      address: {
        street: "",
        complement: "",
        country: "",
        state: "",
        zipCode: "",
        city: "",
      },
      socialAccounts: [],
      profileComplete: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  };
}

Cypress.Commands.add("stubLogin", ({ status = 200, body, alias = "loginRequest" } = {}) => {
  const responseBody = body ?? {
    accessToken: "fake-access-token",
    userId: "1",
  };

  if (status === 200) {
    cy.intercept("POST", "**/auth/refresh", {
      statusCode: 200,
      body: {
        accessToken: String(responseBody.accessToken),
        userId: String(responseBody.userId ?? "1"),
      },
    });
    cy.intercept("GET", "**/user/me", {
      statusCode: 200,
      body: buildUserMeResponse(),
    });
  }

  cy.intercept("POST", "**/auth/login", {
    statusCode: status,
    body: responseBody,
  }).as(alias);
});

Cypress.Commands.add("stubGoogleIdentityScript", () => {
  cy.fixture("google-gis-mock.txt").then((js: string) => {
    cy.intercept("GET", "https://accounts.google.com/gsi/client*", {
      statusCode: 200,
      headers: { "content-type": "application/javascript; charset=utf-8" },
      body: js,
    }).as("googleGisScript");
  });
});

Cypress.Commands.add(
  "stubGoogleLogin",
  ({ status = 200, body, alias = "googleLoginRequest" } = {}) => {
    const responseBody = body ?? {
      accessToken: "fake-google-access-token",
      userId: "google-user-1",
    };

    if (status === 200) {
      cy.intercept("POST", "**/auth/refresh", {
        statusCode: 200,
        body: {
          accessToken: String(responseBody.accessToken),
          userId: String(responseBody.userId ?? "google-user-1"),
        },
      });
      cy.intercept("GET", "**/user/me", {
        statusCode: 200,
        body: buildUserMeResponse({
          id: "google-user-1",
          name: "João Google",
          email: "joao@email.com",
        }),
      });
    }

    cy.intercept("POST", "**/auth/google", {
      statusCode: status,
      body: responseBody,
    }).as(alias);
  },
);

Cypress.Commands.add("stubCnpjLookup", ({ status = 200, body, alias = "cnpjLookup" } = {}) => {
  const responseBody = body ?? {
    cnpj: "12345678000190",
    razao_social: "Empresa LTDA",
    nome_fantasia: "Empresa",
  };

  cy.intercept("GET", "https://brasilapi.com.br/api/cnpj/v1/*", {
    statusCode: status,
    body: responseBody as Record<string, unknown>,
  }).as(alias);
});

Cypress.Commands.add(
  "stubZipCodeLookup",
  ({ status = 200, body, alias = "zipCodeLookup" } = {}) => {
    const responseBody = body ?? {
      cep: "01310-100",
      logradouro: "Av. Paulista",
      complemento: "Sala 1",
      bairro: "Bela Vista",
      localidade: "São Paulo",
      uf: "SP",
    };

    cy.intercept("GET", "https://viacep.com.br/ws/*/json/", {
      statusCode: status,
      body: responseBody as Record<string, unknown>,
    }).as(alias);
  },
);

Cypress.Commands.add("fillAccountStep", (values = {}) => {
  const data = { ...defaultAccount, ...values };
  cy.get('input[name="fullName"]').clear().type(data.fullName);
  cy.get('input[name="phone"]').clear().type(data.phone);
  cy.get('input[name="email"]').clear().type(data.email);
  cy.get('input[name="password"]').clear().type(data.password);
});
