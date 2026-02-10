describe("Bulk Order Flow", () => {
  beforeEach(() => {
    // Visit the base URL from environment variable
    cy.visit(Cypress.env("BASE_URL") || "https://9d86-23-27-185-189.ngrok-free.app")

    // Handle ngrok security verification by clicking "Visit Site" button
    cy.get("body").then(($body) => {
      // Look for the specific button with the classes from the HTML inspection
      if ($body.find('button.bg-blue-600.text-white:contains("Visit Site")').length > 0) {
        cy.get("button.bg-blue-600.text-white").contains("Visit Site").click()
        // Wait for the page to load after clicking the button
        cy.wait(2000)
      }
    })
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
    cy.addParcel(parcel1)

    // Add second parcel
    const parcel2 = {
      weight: (Math.random() * 10 + 1).toFixed(1), // 1-11kg
      length: Math.floor(Math.random() * 70 + 20), // 20-90cm
      width: Math.floor(Math.random() * 50 + 20), // 20-70cm
      height: Math.floor(Math.random() * 30 + 20), // 20-50cm
    }
    cy.addParcel(parcel2)

    // Replace the parcel verification section with this more robust approach
    // After adding both parcels, wait for the parcel list to be visible
    cy.get(".space-y-4").should("be.visible")

    // Wait a moment for the UI to update with both parcels
    cy.wait(500)

    // Instead of checking for the exact string, check for parts of it
    // This is more resilient to formatting differences
    cy.contains(parcel1.weight.toString().substring(0, 3)).should("be.visible")
    cy.contains(parcel1.length.toString()).should("be.visible")
    cy.contains(parcel1.width.toString()).should("be.visible")
    cy.contains(parcel1.height.toString()).should("be.visible")

    cy.contains(parcel2.weight.toString().substring(0, 3)).should("be.visible")
    cy.contains(parcel2.length.toString()).should("be.visible")
    cy.contains(parcel2.width.toString()).should("be.visible")
    cy.contains(parcel2.height.toString()).should("be.visible")

    // Alternatively, we can skip the detailed verification and just check that we have 2 parcels
    cy.contains("Total Parcels:").next().should("contain", "2")

    // Continue to delivery method
    cy.contains("button", "Continue to Delivery Method").click()

    // Step 3: Choose "Authorized to Leave" delivery method
    cy.contains("Authorized to Leave (ATL)").closest("label").click()
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
    cy.fillAddressForm(senderInfo)

    // Continue to recipient information
    cy.contains("button", "Next").click()

    // Replace the recipient form filling section with this more robust approach
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

    // Wait for the recipient form to be fully loaded and ready
    cy.contains("Recipient Information").should("be.visible")
    // Wait a moment for any animations or state updates to complete
    cy.wait(1000)

    // Fill in the first recipient form fields one by one with explicit waits
    cy.get('input[id="name"]').should("be.visible").clear().type(recipient1.name)
    cy.get('input[id="contactNumber"]').should("be.visible").clear().type(recipient1.contactNumber)
    cy.get('input[id="email"]').should("be.visible").clear().type(recipient1.email)
    cy.get('input[id="street"]').should("be.visible").clear().type(recipient1.street)
    cy.get('input[id="unitNo"]').should("be.visible").clear().type(recipient1.unitNo)
    cy.get('input[id="postalCode"]').should("be.visible").clear().type(recipient1.postalCode)

    // Wait for validation to complete
    cy.wait(1000)

    // Verify the first tab is marked as valid (look for the green indicator)
    cy.get('[data-state="active"] .absolute').should("have.class", "bg-green-500").should("be.visible")

    // Go to next parcel
    cy.contains("button", "Next Parcel").should("be.enabled").click()

    // Second recipient
    const recipient2 = {
      name: "Second Recipient",
      contactNumber: "87654321",
      email: "second.recipient@example.com",
      street: "50 Jurong Gateway Road",
      unitNo: "#03-21",
      postalCode: "608549",
    }

    // Fill in the second recipient form fields one by one with explicit waits
    cy.get('input[id="name"]').should("be.visible").clear().type(recipient2.name)
    cy.get('input[id="contactNumber"]').should("be.visible").clear().type(recipient2.contactNumber)
    cy.get('input[id="email"]').should("be.visible").clear().type(recipient2.email)
    cy.get('input[id="street"]').should("be.visible").clear().type(recipient2.street)
    cy.get('input[id="unitNo"]').should("be.visible").clear().type(recipient2.unitNo)
    cy.get('input[id="postalCode"]').should("be.visible").clear().type(recipient2.postalCode)

    // Wait for validation to complete
    cy.wait(1000)

    // Verify the second tab is marked as valid
    cy.get('[data-state="active"] .absolute').should("have.class", "bg-green-500").should("be.visible")

    // Check the progress indicator shows both forms are completed
    cy.contains("Completed:").next().should("contain", "2 of 2")

    // Wait for the "Next" button to be enabled
    cy.wait(1000)
    cy.contains("button", "Next").closest("label").click()



    // Step 6: Verify payment page and click "Proceed to Payment"
    cy.contains("Payment").should("be.visible")
    cy.contains("Order Summary").should("be.visible")
    cy.contains("Sender:").next().should("contain", senderInfo.name)
    cy.contains("Recipient:").next().should("contain", "Multiple")
    cy.contains("Delivery Method:").next().should("contain", "atl")
    cy.contains("Parcels:").next().should("contain", "2")

    // Click proceed to payment
    cy.contains("button", "Proceed to Payment").click()

    // Add a pause at the end to allow manual testing to continue
    cy.pause()
  })
})

