import './commands'

// Configuración global para tests E2E
beforeEach(() => {
  // Limpiar estado antes de cada test
  cy.clearCookies()
  cy.clearLocalStorage()
  
  // Configurar viewport
  cy.viewport(1280, 720)
  
  // Interceptar y esperar a que la página cargue
  cy.intercept('GET', '/api/auth/session').as('authSession')
})

// Comandos custom
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      generateTestCase(requirement: string): Chainable<void>
      waitForLoading(): Chainable<void>
    }
  }
}

// Comando para login
cy.login = (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth/login')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/auth')
  })
}

// Comando para logout
cy.logout = () => {
  cy.visit('/')
  cy.get('button[aria-label="User menu"]').click()
  cy.get('button').contains('Sign out').click()
  cy.url().should('include', '/auth/login')
}

// Comando para generar caso de prueba
cy.generateTestCase = (requirement: string) => {
  cy.visit('/')
  cy.get('textarea[placeholder*="Describe tu requisito"]').type(requirement)
  cy.get('button').contains('Generar Casos de Prueba').click()
  cy.waitForLoading()
  cy.get('[data-testid="test-cases"]').should('be.visible')
}

// Comando para esperar loading
cy.waitForLoading = () => {
  cy.get('[data-testid="loading-spinner"]').should('be.visible')
  cy.get('[data-testid="loading-spinner"]').should('not.exist')
}