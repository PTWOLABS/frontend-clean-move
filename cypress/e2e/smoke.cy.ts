describe("Fluxo principal", () => {
  it("navega entre as páginas de domínio", () => {
    cy.stubLogin();

    cy.visit("/login");
    cy.get('input[name="email"]').type("joao@email.com");
    cy.get('input[name="password"]').type("supersenha");
    cy.contains("button", /^entrar$/i).click();
    cy.wait("@loginRequest");

    cy.url().should("include", "/onboarding");

    cy.contains("Domínio Auth / Login").click();
    cy.url().should("include", "/login");

    cy.contains("Frontend de exemplo").should("not.exist");

    cy.visit("/onboarding");
    cy.contains("Domínio User").click();
    cy.url().should("include", "/user");

    cy.visit("/onboarding");
    cy.contains("Domínio Serviços").click();
    cy.url().should("include", "/services");
  });
});
