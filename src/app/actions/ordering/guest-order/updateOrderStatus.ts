"use server"

import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

type WebhookPayload = {
  payment_id?: string
  payment_request_id?: string
  status?: string
  reference_number?: string
  [key: string]: any
}

export async function updateOrderStatus(
  payload: WebhookPayload,
  signature: string,
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Processing payment update with payload:", payload)

    // Extract the necessary fields, handling both camelCase and snake_case
    const paymentId = payload.payment_id || payload.paymentId
    const paymentRequestId = payload.payment_request_id || payload.paymentRequestId
    const status = payload.status || "pending"
    const referenceNumber = payload.reference_number || payload.referenceNumber

    // For debugging
    console.log("Extracted fields:", {
      paymentId,
      paymentRequestId,
      status,
      referenceNumber,
    })

    // Skip signature verification in development for easier testing
    let isValid = process.env.NODE_ENV === "development"

    if (!isValid && process.env.NODE_ENV !== "development") {
      // Only verify signature in production
      isValid = verifySignature(JSON.stringify(payload), signature)

      if (!isValid) {
        console.error("Invalid signature")
        return { success: false, message: "Invalid signature" }
      }
    }

    // Update the order status in Supabase
    if (referenceNumber) {
      // Map HitPay status to our status
      let orderStatus = status.toLowerCase()

      // HitPay uses "completed" for successful payments, we use "paid"
      if (orderStatus === "completed") {
        orderStatus = "paid"
      }

      const { error } = await supabase.from("orders").update({ status: orderStatus }).eq("id", referenceNumber)

      if (error) {
        console.error("Error updating order status:", error)
        return { success: false, message: `Failed to update order: ${error.message}` }
      }

      console.log(`Updated order ${referenceNumber} status to ${orderStatus}`)
      return { success: true, message: `Order ${referenceNumber} status updated to ${orderStatus}` }
    } else {
      return { success: false, message: "Missing reference number" }
    }
  } catch (error: any) {
    console.error("Error processing payment update:", error)
    return { success: false, message: `Error: ${error.message}` }
  }
}

function verifySignature(payload: string, signature: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", process.env.HITPAY_SALT_KEY || "")
    const expectedSignature = hmac.update(payload).digest("hex")

    // Use timing-safe comparison when possible
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    } catch (e) {
      // Fallback to regular comparison if buffers are different lengths
      return signature === expectedSignature
    }
  } catch (error) {
    console.error("Error verifying signature:", error)
    return false
  }
}

