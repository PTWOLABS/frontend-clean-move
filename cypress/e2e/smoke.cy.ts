describe("Fluxo principal", () => {
  it("navega entre as páginas de domínio", () => {
    cy.visit("/");

    cy.contains("Domínio Auth / Login").click();
    cy.url().should("include", "/login");

    cy.contains("Frontend de exemplo").should("not.exist");

    cy.visit("/");
    cy.contains("Domínio User").click();
    cy.url().should("include", "/user");

    cy.visit("/");
    cy.contains("Domínio Serviços").click();
    cy.url().should("include", "/servicos");
  });
});

