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

Cypress.Commands.add("stubLogin", ({ status = 200, body, alias = "loginRequest" } = {}) => {
  const responseBody = body ?? {
    accessToken: "fake-access-token",
    user: { id: "1", name: "João da Silva", email: "joao@email.com" },
  };

  cy.intercept("POST", "**/auth/login", {
    statusCode: status,
    body: responseBody,
  }).as(alias);
});

Cypress.Commands.add(
  "stubCnpjLookup",
  ({ status = 200, body, alias = "cnpjLookup" } = {}) => {
    const responseBody = body ?? {
      cnpj: "12345678000190",
      razao_social: "Empresa LTDA",
      nome_fantasia: "Empresa",
    };

    cy.intercept("GET", "https://brasilapi.com.br/api/cnpj/v1/*", {
      statusCode: status,
      body: responseBody as Record<string, unknown>,
    }).as(alias);
  },
);

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
