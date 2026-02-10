/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

Cypress.Commands.add("fillAddressForm", (formData) => {
  // Add a small wait before starting to fill the form
  cy.wait(500)

  // Fill each field with explicit waits
  cy.get('input[id="name"]').should("be.visible").clear().type(formData.name)
  cy.wait(100)
  cy.get('input[id="contactNumber"]').should("be.visible").clear().type(formData.contactNumber)
  cy.wait(100)
  cy.get('input[id="email"]').should("be.visible").clear().type(formData.email)
  cy.wait(100)
  cy.get('input[id="street"]').should("be.visible").clear().type(formData.street)
  cy.wait(100)
  cy.get('input[id="unitNo"]').should("be.visible").clear().type(formData.unitNo)
  cy.wait(100)
  cy.get('input[id="postalCode"]').should("be.visible").clear().type(formData.postalCode)

  // Add a longer delay to allow validation to complete
  cy.wait(500)
})

  // -- This is a custom command for adding a parcel --
Cypress.Commands.add("addParcel", (parcelData) => {
    cy.get('input[id="weight"]').clear().type(parcelData.weight.toString())
    cy.get('input[id="length"]').clear().type(parcelData.length.toString())
    cy.get('input[id="width"]').clear().type(parcelData.width.toString())
    cy.get('input[id="height"]').clear().type(parcelData.height.toString())
    cy.contains("button", "Add Parcel").click()
  })

  
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }