"use server"

import { createHitPayRequestBody, type PaymentDetails } from "@/config/hitpay"

export async function initiatePayment(paymentDetails: PaymentDetails) {
  try {
    // Store the order details in your database here
    const orderId = await storeOrderDetails(paymentDetails)

    // Create the request body using the configuration
    const requestBody = createHitPayRequestBody(paymentDetails.amount, paymentDetails.senderName, orderId)

    // Initiate payment with HitPay API
    const response = await fetch("https://api.hitpay.com/v1/payment-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY || "",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error("Failed to initiate payment")
    }

    const data = await response.json()
    return data.url // Return the HitPay payment URL
  } catch (error) {
    console.error("Payment initiation failed:", error)
    throw error
  }
}

async function storeOrderDetails(paymentDetails: PaymentDetails) {
  // Implement your database storage logic here
  // Return a unique order ID
  return "order_" + Math.random().toString(36).substr(2, 9)
}

