describe("Individual Order Flow", () => {
  // Use before() instead of beforeEach() to only run once at the beginning
  before(() => {
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

  // Handle uncaught exceptions to prevent test failure on postMessage errors
  Cypress.on("uncaught:exception", (err) => {
    // Return false to prevent Cypress from failing the test on uncaught exceptions
    if (err.message.includes("postMessage") || err.message.includes("null")) {
      return false
    }
    // For other errors, let Cypress handle them normally
    return true
  })

  it("should complete the individual order flow successfully", () => {
    // Step 1: Click on "Select Individual" card
    cy.contains("Individual Order").should("be.visible")
    cy.contains("button", "Select Individual").click()

    // Step 2: Add parcel details
    // Generate random dimensions within valid ranges
    const weight = (Math.random() * 20 + 1).toFixed(1) // 1-21kg
    const length = Math.floor(Math.random() * 100 + 10) // 10-110cm
    const width = Math.floor(Math.random() * 80 + 10) // 10-90cm
    const height = Math.floor(Math.random() * 60 + 10) // 10-70cm

    // Fill in parcel dimensions
    cy.get('input[id="weight"]').clear().type(weight.toString())
    cy.get('input[id="length"]').clear().type(length.toString())
    cy.get('input[id="width"]').clear().type(width.toString())
    cy.get('input[id="height"]').clear().type(height.toString())

    // Add the parcel
    cy.contains("button", "Add Parcel").click()

    // Verify parcel was added
    cy.contains(`${weight}kg • ${length}cm × ${width}cm × ${height}cm`).should("be.visible")

    // Continue to delivery method
    cy.contains("button", "Continue to Delivery Method").click()

    // Step 3: Choose "Authorized to Leave" delivery method
    cy.contains("Authorized to Leave (ATL)").closest("label").click()
    cy.contains("button", "Next").click()

    // Step 4: Fill in sender information (Singapore address)
    const senderInfo = {
      name: "John Sender",
      contactNumber: "91234567",
      email: "john.sender@example.com",
      street: "123 Orchard Road",
      unitNo: "#05-01",
      postalCode: "238861",
    }

    cy.get('input[id="name"]').clear().type(senderInfo.name)
    cy.get('input[id="contactNumber"]').clear().type(senderInfo.contactNumber)
    cy.get('input[id="email"]').clear().type(senderInfo.email)
    cy.get('input[id="street"]').clear().type(senderInfo.street)
    cy.get('input[id="unitNo"]').clear().type(senderInfo.unitNo)
    cy.get('input[id="postalCode"]').clear().type(senderInfo.postalCode)

    // Continue to recipient information
    cy.contains("button", "Next").click()

    // Step 5: Fill in recipient information (Singapore address)
    cy.wait(500) // Add a small wait to ensure the form is ready
    // Then use our custom command to fill the form more reliably
    cy.fillAddressForm({
      name: "Jane Recipient",
      contactNumber: "98765432",
      email: "jane.recipient@example.com",
      street: "456 Jurong West Street 41",
      unitNo: "#10-12",
      postalCode: "649413",
    })

    // Continue to payment
    cy.contains("button", "Next").click()

    // Step 6: Verify payment page and click "Proceed to Payment"
    cy.contains("Payment").should("be.visible")
    cy.contains("Order Summary").should("be.visible")
    cy.contains("Sender:").next().should("contain", senderInfo.name)
    cy.contains("Recipient:").next().should("contain", "Jane Recipient")
    cy.contains("Delivery Method:").next().should("contain", "atl")

    // Click proceed to payment
    cy.log("**Proceeding to HitPay payment**")

    // Store the current URL before navigating to HitPay
    cy.url().then((currentUrl) => {
      cy.log(`Current URL before payment: ${currentUrl}`)

      // Click the payment button which will redirect to HitPay
      cy.contains("button", "Proceed to Payment").click()

      // Wait for redirection to HitPay
      cy.log("**Waiting for HitPay page to load**")
      
      cy.pause()
    })
  })
})

