describe('Generación de Casos de Prueba', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('debe generar casos de prueba desde texto', () => {
    cy.get('textarea[name="description"]').type('Login de usuario con email y contraseña')
    cy.get('button').contains('Generar Casos de Prueba').click()
    
    // Esperar a que cargue
    cy.get('[data-testid="loading-spinner"]').should('not.exist')
    
    cy.get('[data-testid="test-cases"]').should('be.visible')
    cy.get('[data-testid="test-case"]').should('have.length.at.least', 3)
  })

  it('debe generar casos de prueba desde imagen', () => {
    cy.get('input[type="file"]').selectFile('cypress/fixtures/mock-form.png')
    cy.get('button').contains('Procesar Imagen').click()
    
    // Esperar a que cargue
    cy.get('[data-testid="loading-spinner"]').should('not.exist')
    
    cy.get('[data-testid="test-cases"]').should('be.visible')
  })

  it('debe exportar a Excel', () => {
    cy.get('textarea[name="description"]').type('Formulario de contacto')
    cy.get('button').contains('Generar Casos de Prueba').click()
    
    // Esperar a que cargue
    cy.get('[data-testid="loading-spinner"]').should('not.exist')
    
    cy.get('button[data-testid="export-excel"]').click()
    cy.get('a[data-testid="download-link"]').should('be.visible')
  })

  it('debe exportar a PDF', () => {
    cy.get('textarea[name="description"]').type('Formulario de contacto')
    cy.get('button').contains('Generar Casos de Prueba').click()
    
    // Esperar a que cargue
    cy.get('[data-testid="loading-spinner"]').should('not.exist')
    
    cy.get('button[data-testid="export-pdf"]').click()
    cy.get('a[data-testid="download-link"]').should('be.visible')
  })

  it('debe guardar en favoritos', () => {
    cy.get('textarea[name="description"]').type('Login de usuario')
    cy.get('button').contains('Generar Casos de Prueba').click()
    
    // Esperar a que cargue
    cy.get('[data-testid="loading-spinner"]').should('not.exist')
    
    cy.get('button[data-testid="save-favorite"]').click()
    cy.get('[data-testid="favorite-success"]').should('be.visible')
  })
}