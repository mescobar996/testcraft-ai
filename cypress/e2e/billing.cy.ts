describe('Billing and Subscriptions', () => {
  beforeEach(() => {
    cy.login('testuser@example.com', 'TestPassword123')
  })

  it('should display current subscription info', () => {
    cy.visit('/billing')
    
    cy.get('[data-testid="subscription-tier"]').should('be.visible')
    cy.get('[data-testid="subscription-status"]').should('be.visible')
    cy.get('[data-testid="usage-count"]').should('be.visible')
  })

  it('should allow plan upgrade', () => {
    cy.visit('/billing')
    
    // Verificar que estamos en plan gratis
    cy.get('[data-testid="subscription-tier"]').should('contain', 'free')
    
    // Intentar upgrade a Pro
    cy.get('[data-testid="plan-card-pro"]').within(() => {
      cy.get('button').contains('Elegir Plan').click()
    })
    
    // Debería redirigir a Stripe Checkout
    cy.url().should('include', 'stripe.com')
  })

  it('should show success message after successful payment', () => {
    cy.visit('/billing?success=true')
    cy.get('[data-testid="success-message"]').should('contain', '¡Suscripción actualizada exitosamente!')
  })

  it('should show canceled message after canceled payment', () => {
    cy.visit('/billing?canceled=true')
    cy.get('[data-testid="canceled-message"]').should('contain', 'El proceso de suscripción fue cancelado')
  })

  it('should redirect to billing when accessing pricing as authenticated user', () => {
    cy.visit('/pricing')
    cy.url().should('include', '/billing')
  })

  it('should display pricing information', () => {
    cy.visit('/billing')
    
    // Verificar que se muestran los tres planes
    cy.get('[data-testid="plan-card-free"]').should('be.visible')
    cy.get('[data-testid="plan-card-pro"]').should('be.visible')
    cy.get('[data-testid="plan-card-enterprise"]').should('be.visible')
    
    // Verificar características de cada plan
    cy.get('[data-testid="plan-card-free"]')
      .should('contain', 'Gratis')
      .should('contain', '10 casos de prueba por mes')
    
    cy.get('[data-testid="plan-card-pro"]')
      .should('contain', 'Pro')
      .should('contain', '500 casos de prueba por mes')
  })
})