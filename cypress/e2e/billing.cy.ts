describe('Billing y Suscripciones', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'Test123!')
  })

  it('debe mostrar página de billing', () => {
    cy.visit('/billing')
    cy.get('[data-testid="current-plan"]').should('be.visible')
    cy.get('[data-testid="usage-meter"]').should('be.visible')
  })

  it('debe cambiar de plan', () => {
    cy.visit('/billing')
    cy.get('button[data-plan="pro"]').click()
    cy.get('button[data-testid="confirm-change"]').click()
    
    cy.url().should('include', '/stripe/checkout')
  })

  it('debe cancelar suscripción', () => {
    cy.visit('/billing')
    cy.get('button[data-testid="cancel-subscription"]').click()
    cy.get('button[data-testid="confirm-cancel"]').click()
    
    cy.get('[data-testid="cancel-success"]').should('be.visible')
  })

  it('debe mostrar historial de facturación', () => {
    cy.visit('/billing')
    cy.get('[data-testid="billing-history"]').should('be.visible')
    cy.get('[data-testid="invoice-item"]').should('have.length.at.least', 1)
  })
})