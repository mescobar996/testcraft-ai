describe('Autenticación', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('debe registrar un nuevo usuario', () => {
    cy.visit('/auth/register')
    cy.get('input[name="name"]').type('Test User')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('Test123!')
    cy.get('input[name="confirmPassword"]').type('Test123!')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-menu"]').should('contain', 'Test User')
  })

  it('debe iniciar sesión con credenciales válidas', () => {
    cy.login('test@example.com', 'Test123!')
    cy.url().should('include', '/dashboard')
  })

  it('debe mostrar error con credenciales inválidas', () => {
    cy.visit('/auth/login')
    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    cy.get('[data-testid="error-message"]').should('be.visible')
  })

  it('debe recuperar contraseña', () => {
    cy.visit('/auth/reset-password')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('button[type="submit"]').click()
    
    cy.get('[data-testid="success-message"]').should('be.visible')
  })

  it('debe cerrar sesión', () => {
    cy.login('test@example.com', 'Test123!')
    cy.get('[data-testid="user-menu"]').click()
    cy.get('button[data-testid="logout-button"]').click()
    
    cy.url().should('include', '/auth/login')
  })
})