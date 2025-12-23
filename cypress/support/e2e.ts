/// <reference types="cypress" />

// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Comando para login
Cypress.Commands.add('login', (email: string, password: string): Cypress.Chainable<any> => {
  return cy.session([email, password], () => {
    cy.visit('/auth/login')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Comando para logout
Cypress.Commands.add('logout', (): Cypress.Chainable<any> => {
  return cy.visit('/').then(() => {
    cy.get('button[data-testid="logout-button"]').click({ force: true })
    cy.url().should('include', '/auth/login')
  })
})

// Comando para generar casos de prueba
Cypress.Commands.add('generateTestCases', (description: string): Cypress.Chainable<any> => {
  return cy.get('textarea[name="description"]').type(description)
    .get('button[type="submit"]').click()
    .get('[data-testid="test-cases-list"]').should('be.visible')
})

// Comando para exportar a Excel
Cypress.Commands.add('exportToExcel', (): Cypress.Chainable<any> => {
  return cy.get('button[data-testid="export-excel"]').click()
    .get('a[data-testid="download-link"]').should('be.visible')
})

// Comando para exportar a PDF
Cypress.Commands.add('exportToPDF', (): Cypress.Chainable<any> => {
  return cy.get('button[data-testid="export-pdf"]').click()
    .get('a[data-testid="download-link"]').should('be.visible')
})

// Comando para cambiar de plan
Cypress.Commands.add('changePlan', (plan: string): Cypress.Chainable<any> => {
  return cy.visit('/billing')
    .get(`button[data-plan="${plan}"]`).click()
    .get('button[data-testid="confirm-change"]').click()
    .url().should('include', '/stripe/checkout')
})

// Comando para crear integración
Cypress.Commands.add('createIntegration', (type: string, config: any): Cypress.Chainable<any> => {
  return cy.visit('/settings/integrations')
    .get(`button[data-integration="${type}"]`).click()
    .get('input[name="apiKey"]').type(config.apiKey)
    .get('input[name="domain"]').type(config.domain)
    .get('button[type="submit"]').click()
    .get('[data-testid="integration-success"]').should('be.visible')
})

// Comando para generar plan de prueba
Cypress.Commands.add('generateTestPlan', (requirements: string): Cypress.Chainable<any> => {
  return cy.get('textarea[name="requirements"]').type(requirements)
    .get('button[data-testid="generate-plan"]').click()
    .get('[data-testid="test-plan-result"]').should('be.visible')
})

// Comando para exportar plan de prueba
Cypress.Commands.add('exportTestPlan', (format: string): Cypress.Chainable<any> => {
  return cy.get(`button[data-format="${format}"]`).click()
    .get('[data-testid="export-success"]').should('be.visible')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<any>
      logout(): Chainable<any>
      generateTestCases(description: string): Chainable<any>
      exportToExcel(): Chainable<any>
      exportToPDF(): Chainable<any>
      changePlan(plan: string): Chainable<any>
      createIntegration(type: string, config: any): Chainable<any>
      generateTestPlan(requirements: string): Chainable<any>
      exportTestPlan(format: string): Chainable<any>
    }
  }
}

// Evitar errores de tipo en el archivo
export {}