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
    // Use specific dimensions that will result in a predictable tier
    // Weight: 3kg (T1 by weight)
    // Dimensions: 30cm x 30cm x 15cm = 13,500 cm³
    // Volumetric weight: 13,500 / 5000 = 2.7kg (T2 by volumetric)
    // Expected effective tier: T2 (since volumetric tier is higher)
    const weight = 3
    const length = 30
    const width = 30
    const height = 15

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

    // Check that the pricing tier is correctly displayed
    cy.contains("Show Details").click()

    // Check actual weight tier
    cy.contains("Actual Weight:").parent().should("contain", "T1")

    // Check volumetric weight tier
    cy.contains("Volumetric Weight:").parent().should("contain", "T2")

    // Check effective tier (should be T2 since volumetric is higher)
    cy.contains("Pricing Tier:").parent().should("contain", "T2")

    // Check that the price matches T2 price ($5.80)
    cy.contains("Base Price:").parent().should("contain", "$5.80")

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

    // Verify the total price matches our expected T2 price
    cy.contains("Total Price:").next().should("contain", "$5.80")

    // Check the terms and conditions checkbox
    cy.get('input[id="terms-checkbox"]').check()

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
