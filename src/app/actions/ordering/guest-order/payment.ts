"use server"

import { createClient } from "@supabase/supabase-js"
import { createHitPayRequestBody } from "@/config/hitpay"
import type { OrderDetails } from "@/types/order"

// Create a Supabase client with the service role key for server-side operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
})

type PaymentInitiationDetails = {
  amount: number
  orderDetails: OrderDetails
}

export async function initiatePayment({ amount, orderDetails }: PaymentInitiationDetails) {
  try {
    // Validate required fields
    if (!orderDetails.senderEmail || !orderDetails.senderName) {
      throw new Error("Missing required order details")
    }

    // Store the order details in Supabase
    const { data: insertedData, error } = await supabase
      .from("orders")
      .insert({
        sender_name: orderDetails.senderName,
        sender_address: orderDetails.senderAddress,
        sender_contact_number: orderDetails.senderContactNumber,
        sender_email: orderDetails.senderEmail,
        recipient_name: orderDetails.recipientName,
        recipient_address: orderDetails.recipientAddress,
        recipient_contact_number: orderDetails.recipientContactNumber,
        recipient_email: orderDetails.recipientEmail,
        recipient_line1: orderDetails.recipientLine1,
        recipient_line2: orderDetails.recipientLine2,
        recipient_postal_code: orderDetails.recipientPostalCode,
        parcel_size: orderDetails.parcelSize,
        delivery_method: orderDetails.deliveryMethod,
        amount: amount,
        status: "pending", // Set initial status
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to store order details: ${error.message}`)
    }

    if (!insertedData) {
      throw new Error("Failed to retrieve inserted order details")
    }

    // Use the generated UUID as the order number
    const orderNumber = insertedData.id

    // Create the request body using the configuration
    const requestBody = createHitPayRequestBody(amount, {
      ...orderDetails,
      orderNumber: orderNumber,
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

    const hitpayResponse = await response.json()
    return hitpayResponse.url // Return the HitPay payment URL
  } catch (error) {
    console.error("Payment initiation failed:", error)
    throw error
  }
}

