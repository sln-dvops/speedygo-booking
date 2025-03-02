"use server"

import { createHitPayRequestBody } from "@/config/hitpay"
import type { OrderDetails } from "@/types/order"

type PaymentInitiationDetails = {
  amount: number
  orderDetails: OrderDetails
}

export async function initiatePayment({ amount, orderDetails }: PaymentInitiationDetails) {
  try {
    // Validate required fields
    if (!orderDetails.senderEmail || !orderDetails.senderName || !orderDetails.orderNumber) {
      throw new Error("Missing required order details")
    }

    // Store the order details in your database here
    const orderId = await storeOrderDetails(orderDetails)

    // Create the request body using the configuration
    const requestBody = createHitPayRequestBody(amount, {
      ...orderDetails,
      orderNumber: orderId,
    })

    // Determine the API endpoint based on the environment
    const apiEndpoint =
      process.env.NODE_ENV === "production"
        ? "https://api.hit-pay.com/v1/payment-requests"
        : "https://api.sandbox.hit-pay.com/v1/payment-requests"

    // Initiate payment with HitPay API
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY || "",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to initiate payment: ${response.status} ${response.statusText}\n${errorText}`)
    }

    const data = await response.json()
    return data.url // Return the HitPay payment URL
  } catch (error) {
    console.error("Payment initiation failed:", error)
    throw error
  }
}

async function storeOrderDetails(orderDetails: OrderDetails): Promise<string> {
  // Implement your database storage logic here
  // Return a unique order ID
  return orderDetails.orderNumber || `ORDER-${Date.now()}`
}

