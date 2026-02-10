/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to fill an address form
       * @example cy.fillAddressForm({ name: 'John Doe', ... })
       */
      fillAddressForm(formData: {
        name: string
        contactNumber: string
        email: string
        street: string
        unitNo: string
        postalCode: string
      }): Chainable<Element>
  
      /**
       * Custom command to add a parcel with dimensions
       * @example cy.addParcel({ weight: 5, length: 30, width: 20, height: 15 })
       */
      addParcel(parcelData: {
        weight: number | string
        length: number | string
        width: number | string
        height: number | string
      }): Chainable<Element>

      
    }
  }
  
  