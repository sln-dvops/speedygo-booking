describe("Bulk Order Flow", () => {
    beforeEach(() => {
      // Visit the base URL from environment variable
      cy.visit(Cypress.env("BASE_URL") || "https://9d86-23-27-185-189.ngrok-free.app")
    })
  
    it("should complete the bulk order flow successfully", () => {
      // Step 1: Click on "Select Bulk" card
      cy.contains("Bulk Order").should("be.visible")
      cy.contains("button", "Select Bulk").click()
  
      // Step 2: Add multiple parcels
      // Add first parcel
      const parcel1 = {
        weight: (Math.random() * 15 + 1).toFixed(1), // 1-16kg
        length: Math.floor(Math.random() * 80 + 20), // 20-100cm
        width: Math.floor(Math.random() * 60 + 20), // 20-80cm
        height: Math.floor(Math.random() * 40 + 20), // 20-60cm
      }
  
      cy.get('input[id="weight"]').clear().type(parcel1.weight.toString())
      cy.get('input[id="length"]').clear().type(parcel1.length.toString())
      cy.get('input[id="width"]').clear().type(parcel1.width.toString())
      cy.get('input[id="height"]').clear().type(parcel1.height.toString())
      cy.contains("button", "Add Parcel").click()
  
      // Add second parcel
      const parcel2 = {
        weight: (Math.random() * 10 + 1).toFixed(1), // 1-11kg
        length: Math.floor(Math.random() * 70 + 20), // 20-90cm
        width: Math.floor(Math.random() * 50 + 20), // 20-70cm
        height: Math.floor(Math.random() * 30 + 20), // 20-50cm
      }
  
      cy.get('input[id="weight"]').clear().type(parcel2.weight.toString())
      cy.get('input[id="length"]').clear().type(parcel2.length.toString())
      cy.get('input[id="width"]').clear().type(parcel2.width.toString())
      cy.get('input[id="height"]').clear().type(parcel2.height.toString())
      cy.contains("button", "Add Parcel").click()
  
      // Verify parcels were added
      cy.contains(`${parcel1.weight}kg • ${parcel1.length}cm × ${parcel1.width}cm × ${parcel1.height}cm`).should(
        "be.visible",
      )
      cy.contains(`${parcel2.weight}kg • ${parcel2.length}cm × ${parcel2.width}cm × ${parcel2.height}cm`).should(
        "be.visible",
      )
  
      // Continue to delivery method
      cy.contains("button", "Continue to Delivery Method").click()
  
      // Step 3: Choose "Authorized to Leave" delivery method
      cy.contains("Authorized to Leave (ATL)").parent().click()
      cy.contains("button", "Next").click()
  
      // Step 4: Fill in sender information (Singapore address)
      const senderInfo = {
        name: "Company Sender",
        contactNumber: "91234567",
        email: "company@example.com",
        street: "10 Anson Road",
        unitNo: "#14-01",
        postalCode: "079903",
      }
  
      cy.get('input[id="name"]').clear().type(senderInfo.name)
      cy.get('input[id="contactNumber"]').clear().type(senderInfo.contactNumber)
      cy.get('input[id="email"]').clear().type(senderInfo.email)
      cy.get('input[id="street"]').clear().type(senderInfo.street)
      cy.get('input[id="unitNo"]').clear().type(senderInfo.unitNo)
      cy.get('input[id="postalCode"]').clear().type(senderInfo.postalCode)
  
      // Continue to recipient information
      cy.contains("button", "Next").click()
  
      // Step 5: Fill in recipient information for each parcel
      // First recipient
      const recipient1 = {
        name: "First Recipient",
        contactNumber: "98765432",
        email: "first.recipient@example.com",
        street: "1 Raffles Place",
        unitNo: "#20-01",
        postalCode: "048616",
      }
  
      cy.get('input[id="name"]').clear().type(recipient1.name)
      cy.get('input[id="contactNumber"]').clear().type(recipient1.contactNumber)
      cy.get('input[id="email"]').clear().type(recipient1.email)
      cy.get('input[id="street"]').clear().type(recipient1.street)
      cy.get('input[id="unitNo"]').clear().type(recipient1.unitNo)
      cy.get('input[id="postalCode"]').clear().type(recipient1.postalCode)
  
      // Go to next parcel
      cy.contains("button", "Next Parcel").click()
  
      // Second recipient
      const recipient2 = {
        name: "Second Recipient",
        contactNumber: "87654321",
        email: "second.recipient@example.com",
        street: "50 Jurong Gateway Road",
        unitNo: "#03-21",
        postalCode: "608549",
      }
  
      cy.get('input[id="name"]').clear().type(recipient2.name)
      cy.get('input[id="contactNumber"]').clear().type(recipient2.contactNumber)
      cy.get('input[id="email"]').clear().type(recipient2.email)
      cy.get('input[id="street"]').clear().type(recipient2.street)
      cy.get('input[id="unitNo"]').clear().type(recipient2.unitNo)
      cy.get('input[id="postalCode"]').clear().type(recipient2.postalCode)
  
      // Continue to payment
      cy.contains("button", "Next").click()
  
      // Step 6: Verify payment page and click "Proceed to Payment"
      cy.contains("Payment").should("be.visible")
      cy.contains("Order Summary").should("be.visible")
      cy.contains("Sender:").next().should("contain", senderInfo.name)
      cy.contains("Recipient:").next().should("contain", "Multiple")
      cy.contains("Delivery Method:").next().should("contain", "atl")
      cy.contains("Parcels:").next().should("contain", "2")
  
      // Click proceed to payment
      cy.contains("button", "Proceed to Payment").click()
  
      // Verify redirection to payment provider
      cy.url().should("not.eq", Cypress.env("BASE_URL") || "https://9d86-23-27-185-189.ngrok-free.app")
    })
  })
  
  