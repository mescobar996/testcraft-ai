describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/billing')
    cy.url().should('include', '/auth/login')
    cy.get('h2').should('contain', 'Bienvenido de vuelta')
  })

  it('should allow user registration', () => {
    cy.visit('/auth/register')
    
    cy.get('input[name="name"]').type('Test User')
    cy.get('input[name="email"]').type('testuser@example.com')
    cy.get('input[name="password"]').type('TestPassword123')
    cy.get('input[name="confirmPassword"]').type('TestPassword123')
    
    cy.get('button[type="submit"]').click()
    
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('[data-testid="welcome-message"]').should('be.visible')
  })

  it('should allow user login', () => {
    cy.visit('/auth/login')
    
    cy.get('input[name="email"]').type('testuser@example.com')
    cy.get('input[name="password"]').type('TestPassword123')
    
    cy.get('button[type="submit"]').click()
    
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('[data-testid="user-menu"]').should('be.visible')
  })

  it('should show validation errors', () => {
    cy.visit('/auth/register')
    
    cy.get('button[type="submit"]').click()
    
    cy.get('[data-testid="error-name"]').should('contain', 'El nombre es requerido')
    cy.get('[data-testid="error-email"]').should('contain', 'El email es requerido')
    cy.get('[data-testid="error-password"]').should('contain', 'La contraseña es requerida')
  })

  it('should allow password recovery', () => {
    cy.visit('/auth/login')
    
    cy.get('button').contains('¿Olvidaste tu contraseña?').click()
    
    cy.get('input[name="forgotEmail"]').type('testuser@example.com')
    cy.get('button[type="submit"]').click()
    
    cy.get('[data-testid="success-message"]').should('contain', 'Si el email existe')
  })

  it('should redirect authenticated users from auth pages', () => {
    cy.login('testuser@example.com', 'TestPassword123')
    
    cy.visit('/auth/login')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    cy.visit('/auth/register')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})