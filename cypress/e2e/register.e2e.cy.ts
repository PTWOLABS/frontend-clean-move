describe("Registration flow", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("should display the registration page on the account step", () => {
    cy.contains("h1", /crie sua conta/i).should("be.visible");
    cy.contains(/comece a configurar sua plataforma/i).should("be.visible");

    cy.get('input[name="fullName"]').should("be.visible");
    cy.get('input[name="phone"]').should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");

    cy.contains("a", /fazer login/i).should("have.attr", "href", "/login");
    cy.contains("button", /^continuar$/i).should("be.disabled");
  });

  it("should keep the continue button disabled while the account step is invalid", () => {
    cy.contains("button", /^continuar$/i).should("be.disabled");

    cy.get('input[name="fullName"]').type("João da Silva");
    cy.contains("button", /^continuar$/i).should("be.disabled");

    cy.get('input[name="phone"]').type("11999991234");
    cy.get('input[name="email"]').type("invalid-email");
    cy.get('input[name="password"]').type("supersenha");

    cy.contains("button", /^continuar$/i).should("be.disabled");
  });

  it("should advance to the company step after filling valid account data", () => {
    cy.fillAccountStep();

    cy.contains("button", /^continuar$/i)
      .should("be.enabled")
      .click();

    cy.contains("h1", /dados da empresa/i).should("be.visible");
    cy.get('input[name="cnpj"]').should("be.visible");
    cy.get('input[name="legalName"]').should("be.visible");
    cy.get('input[name="tradeName"]').should("be.visible");
  });

  it("should autofill legalname and tradename when the cnpj lookup succeeds", () => {
    cy.stubCnpjLookup();
    cy.fillAccountStep();
    cy.contains("button", /^continuar$/i).click();

    cy.get('input[name="cnpj"]').type("12345678000190");

    cy.wait("@cnpjLookup");
    cy.get('input[name="legalName"]').should("have.value", "Empresa LTDA");
    cy.get('input[name="tradeName"]').should("have.value", "Empresa");
  });

  it("should display a fallback message when the cnpj lookup fails", () => {
    cy.stubCnpjLookup({ status: 500, body: { message: "boom" } });
    cy.fillAccountStep();
    cy.contains("button", /^continuar$/i).click();

    cy.get('input[name="cnpj"]').type("12345678000190");

    cy.wait("@cnpjLookup");
    cy.contains(/não foi possível consultar o cnpj/i).should("be.visible");
  });

  it("should preserve the account data when going back from the company step", () => {
    cy.fillAccountStep();
    cy.contains("button", /^continuar$/i).click();

    cy.contains("h1", /dados da empresa/i).should("be.visible");
    cy.contains("button", /voltar/i).click();

    cy.contains("h1", /crie sua conta/i).should("be.visible");
    cy.get('input[name="fullName"]').should("have.value", "João da Silva");
    cy.get('input[name="email"]').should("have.value", "joao@email.com");
  });

  it("should advance to the address step from a valid company step", () => {
    cy.stubCnpjLookup();
    cy.fillAccountStep();
    cy.contains("button", /^continuar$/i).click();

    cy.get('input[name="cnpj"]').type("12345678000190");
    cy.wait("@cnpjLookup");

    cy.contains("button", /^continuar$/i)
      .should("be.enabled")
      .click();
    cy.contains("h1", /endereço da empresa/i).should("be.visible");
    cy.get('input[name="zipCode"]').should("be.visible");
  });

  it("should autofill the address fields when the cep lookup succeeds", () => {
    cy.stubCnpjLookup();
    cy.stubZipCodeLookup();
    cy.fillAccountStep();
    cy.contains("button", /^continuar$/i).click();

    cy.get('input[name="cnpj"]').type("12345678000190");
    cy.wait("@cnpjLookup");
    cy.contains("button", /^continuar$/i).click();

    cy.get('input[name="zipCode"]').type("01310100");
    cy.wait("@zipCodeLookup");

    cy.get('input[name="street"]').should("have.value", "Av. Paulista");
    cy.get('input[name="city"]').should("have.value", "São Paulo");
    cy.get('input[name="state"]').should("have.value", "SP");
    cy.get('input[name="complement"]').should("have.value", "Sala 1");
  });

  it("should display a fallback message when the cep lookup fails", () => {
    cy.stubCnpjLookup();
    cy.stubZipCodeLookup({ status: 500, body: { message: "boom" } });
    cy.fillAccountStep();
    cy.contains("button", /^continuar$/i).click();

    cy.get('input[name="cnpj"]').type("12345678000190");
    cy.wait("@cnpjLookup");
    cy.contains("button", /^continuar$/i).click();

    cy.get('input[name="zipCode"]').type("01310100");
    cy.wait("@zipCodeLookup");

    cy.contains(/não foi possível consultar o cep/i).should("be.visible");
  });

  it("should walk through all the steps until the final submit", () => {
    cy.stubCnpjLookup();
    cy.stubZipCodeLookup();
    cy.fillAccountStep();
    cy.contains("button", /^continuar$/i).click();

    cy.get('input[name="cnpj"]').type("12345678000190");
    cy.wait("@cnpjLookup");
    cy.contains("button", /^continuar$/i).click();

    cy.get('input[name="zipCode"]').type("01310100");
    cy.wait("@zipCodeLookup");
    cy.get('input[name="number"]').type("1000");

    cy.contains("button", /finalizar cadastro/i)
      .should("be.enabled")
      .click();

    cy.contains("h1", /endereço da empresa/i).should("be.visible");
  });

  it("should navigate to the login page from the link", () => {
    cy.contains("a", /fazer login/i).click();
    cy.url().should("include", "/login");
    cy.contains("h1", /bem-vindo de volta/i).should("be.visible");
  });
});
