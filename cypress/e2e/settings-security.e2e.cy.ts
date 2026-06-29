const defaultUser = {
  id: "1",
  establishmentId: "6eaf3de8-8216-4a55-8cee-b1d374e07c6e",
  onboardingCompletedAt: "2026-01-01T00:00:00.000Z",
  name: "João da Silva",
  email: "joao@email.com",
  role: "ESTABLISHMENT",
  profileImageUrl: null,
  phone: "11987654321",
  address: {
    street: "Estrada Farmaceutico Oswaldo Paiva",
    complement: null,
    country: "Brasil",
    state: "SP",
    zipCode: "13963060",
    city: "Socorro",
  },
  socialAccounts: [],
  hasPassword: true,
  profileComplete: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function stubSecuritySettingsUser(hasPassword: boolean) {
  cy.intercept("GET", "**/user/me", {
    statusCode: 200,
    body: {
      user: {
        ...defaultUser,
        hasPassword,
      },
    },
  });
}

function loginAndVisitSecurityTab() {
  cy.stubLogin({
    body: {
      accessToken: "fake-access-token",
      userId: "1",
      onboardingCompletedAt: "2026-01-01T00:00:00.000Z",
    },
  });

  cy.visit("/login");
  cy.get('input[name="email"]').type("joao@email.com");
  cy.get('input[name="password"]').type("supersenha");
  cy.contains("button", /^entrar$/i).click();
  cy.wait("@loginRequest");
  cy.url().should("include", "/dashboard");
  cy.visit("/settings?tab=security");
}

describe("Settings security tab", () => {
  it("should show set-password form when hasPassword is false", () => {
    loginAndVisitSecurityTab();
    stubSecuritySettingsUser(false);

    cy.reload();
    cy.contains(/definir senha/i).should("be.visible");
    cy.get('input[name="currentPassword"]').should("not.exist");
    cy.get('input[name="newPassword"]').should("be.visible");
    cy.get('input[name="confirmPassword"]').should("be.visible");
  });

  it("should send only newPassword when defining the first local password", () => {
    loginAndVisitSecurityTab();
    stubSecuritySettingsUser(false);

    cy.intercept("POST", "**/user/me/password", {
      statusCode: 200,
      body: { message: "Password updated successfully." },
    }).as("updatePassword");

    cy.reload();
    cy.get('input[name="newPassword"]').type("novaSenha123");
    cy.get('input[name="confirmPassword"]').type("novaSenha123");
    cy.contains("button", /definir senha/i).click();
    cy.contains("button", /definir senha/i)
      .last()
      .click();

    cy.wait("@updatePassword").its("request.body").should("deep.equal", {
      newPassword: "novaSenha123",
    });
    cy.url().should("include", "/login");
  });

  it("should send currentPassword and newPassword when changing an existing password", () => {
    loginAndVisitSecurityTab();
    stubSecuritySettingsUser(true);

    cy.intercept("POST", "**/user/me/password", {
      statusCode: 200,
      body: { message: "Password updated successfully." },
    }).as("updatePassword");

    cy.reload();
    cy.contains(/alterar senha/i).should("be.visible");
    cy.get('input[name="currentPassword"]').type("senhaAtual123");
    cy.get('input[name="newPassword"]').type("novaSenha123");
    cy.get('input[name="confirmPassword"]').type("novaSenha123");
    cy.contains("button", /^alterar senha$/i).click();
    cy.contains("button", /^alterar senha$/i)
      .last()
      .click();

    cy.wait("@updatePassword").its("request.body").should("deep.equal", {
      currentPassword: "senhaAtual123",
      newPassword: "novaSenha123",
    });
    cy.url().should("include", "/login");
  });

  it("should show current password field error for INVALID_CURRENT_PASSWORD", () => {
    loginAndVisitSecurityTab();
    stubSecuritySettingsUser(true);

    cy.intercept("POST", "**/user/me/password", {
      statusCode: 400,
      body: {
        statusCode: 400,
        error: "Bad Request",
        message: "The current password you entered is incorrect. Check the password and try again.",
        code: "INVALID_CURRENT_PASSWORD",
        field: "currentPassword",
      },
    }).as("updatePassword");

    cy.reload();
    cy.get('input[name="currentPassword"]').type("senhaErrada");
    cy.get('input[name="newPassword"]').type("novaSenha123");
    cy.get('input[name="confirmPassword"]').type("novaSenha123");
    cy.contains("button", /^alterar senha$/i).click();
    cy.contains("button", /^alterar senha$/i)
      .last()
      .click();

    cy.wait("@updatePassword");
    cy.contains(/senha atual informada está incorreta/i).should("be.visible");
  });
});
