describe('AutoML Platform E2E', () => {
  const username = 'devuser';
  const password = 'password123';

  before(() => {
    // ensure test fixture exists
    cy.fixture('test.csv').then((fileContent) => {
      cy.writeFile('cypress/fixtures/test.csv', fileContent);
    });
  });

  it('should allow user to login, upload file, chat, and build pipeline', () => {
    // Visit login page
    cy.visit('/login');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.contains('Login').click();
    cy.url().should('not.include', '/login');

    // Data Upload tab
    cy.contains('Data Upload').click();
    cy.get('select[name="modality"]').select('structured');
    cy.get('input[type="file"]').attachFile('test.csv');
    cy.contains('Upload File').click();
    cy.contains('uploaded successfully').should('be.visible');

    // AI Assistant tab
    cy.contains('AI Assistant').click();
    cy.get('textarea[placeholder="Type your message..."]').type('Hello AutoML{enter}');
    cy.contains('AI is thinking').should('be.visible');
    cy.contains('Hello').should('be.visible');

    // Pipeline Builder tab
    cy.contains('Pipeline Builder').click();
    cy.contains('Add Preprocess').click();
    cy.contains('Save Pipeline').click();
    cy.contains('Pipeline saved successfully').should('be.visible');
  });
});
