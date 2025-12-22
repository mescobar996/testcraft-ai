describe('Test Case Generation', () => {
  beforeEach(() => {
    cy.login('testuser@example.com', 'TestPassword123')
    cy.visit('/')
  })

  it('should generate test cases from text requirement', () => {
    const requirement = 'Como usuario quiero poder iniciar sesión en el sistema con mi email y contraseña'
    
    cy.get('textarea[placeholder*="Describe tu requisito"]').type(requirement)
    cy.get('button').contains('Generar Casos de Prueba').click()
    
    cy.waitForLoading()
    
    cy.get('[data-testid="test-cases"]').should('be.visible')
    cy.get('[data-testid="test-case"]').should('have.length.at.least', 3)
    
    // Verificar que hay casos de diferentes tipos
    cy.get('[data-testid="test-case-type"]').should('contain', 'Positivo')
    cy.get('[data-testid="test-case-type"]').should('contain', 'Negativo')
  })

  it('should generate test cases from image', () => {
    cy.get('input[type="file"]').selectFile({
      contents: 'cypress/fixtures/login-mockup.png',
      fileName: 'login-mockup.png',
      mimeType: 'image/png'
    })
    
    cy.get('button').contains('Generar desde Imagen').click()
    cy.waitForLoading()
    
    cy.get('[data-testid="test-cases"]').should('be.visible')
  })

  it('should show validation error for empty requirement', () => {
    cy.get('button').contains('Generar Casos de Prueba').click()
    cy.get('[data-testid="error-requirement"]').should('contain', 'El requisito debe tener al menos 10 caracteres')
  })

  it('should export test cases to Excel', () => {
    cy.generateTestCase('Proceso de login de usuario con email y contraseña')
    
    cy.get('button').contains('Exportar a Excel').click()
    cy.get('[data-testid="download-trigger"]').should('be.visible')
  })

  it('should export test cases to PDF', () => {
    cy.generateTestCase('Proceso de login de usuario con email y contraseña')
    
    cy.get('button').contains('Exportar a PDF').click()
    cy.get('[data-testid="download-trigger"]').should('be.visible')
  })

  it('should export test cases to Gherkin', () => {
    cy.generateTestCase('Proceso de login de usuario con email y contraseña')
    
    cy.get('button').contains('Exportar a Gherkin').click()
    cy.get('[data-testid="gherkin-output"]').should('be.visible')
    cy.get('[data-testid="gherkin-output"]').should('contain', 'Feature:')
    cy.get('[data-testid="gherkin-output"]').should('contain', 'Scenario:')
  })

  it('should handle rate limiting', () => {
    // Hacer múltiples requests para probar rate limiting
    for (let i = 0; i < 12; i++) {
      cy.get('textarea[placeholder*="Describe tu requisito"]').clear().type(`Requisito ${i}`)
      cy.get('button').contains('Generar Casos de Prueba').click()
    }
    
    cy.get('[data-testid="rate-limit-error"]').should('contain', 'Has excedido el límite')
  })
})