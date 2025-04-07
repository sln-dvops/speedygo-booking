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
    cy.get('input[id="name"]').clear().type(formData.name)
    cy.get('input[id="contactNumber"]').clear().type(formData.contactNumber)
    cy.get('input[id="email"]').clear().type(formData.email)
    cy.get('input[id="street"]').clear().type(formData.street)
    cy.get('input[id="unitNo"]').clear().type(formData.unitNo)
    cy.get('input[id="postalCode"]').clear().type(formData.postalCode)
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