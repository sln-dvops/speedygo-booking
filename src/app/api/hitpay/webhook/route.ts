import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/utils/supabase/server"
import { createDetrackOrder } from "@/app/actions/ordering/guest-order/createDetrackOrder"

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body as form data
    const rawBody = await request.text()
    console.log("Raw webhook payload:", rawBody)

    // Parse the form data
    const formData = Object.fromEntries(new URLSearchParams(rawBody))
    console.log("Parsed form data:", formData)

    // Extract the HMAC from the form data
    const receivedHmac = formData.hmac
    if (!receivedHmac) {
      console.error("Missing HMAC signature")
      return NextResponse.json({ error: "Missing HMAC signature" }, { status: 400 })
    }

    // Validate the HMAC signature
    const isValid = validateHmac(formData, process.env.HITPAY_SALT_KEY || "")

    if (!isValid) {
      console.error("Invalid HMAC signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("HMAC signature validated successfully")

    // Extract payment details
    const { payment_id, payment_request_id, status, reference_number, amount, currency } = formData

    console.log("Processing payment update:", {
      payment_id,
      payment_request_id,
      status,
      reference_number,
      amount,
      currency,
    })

    // Only process if we have a reference number and status
    if (!reference_number || !status) {
      console.error("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Map HitPay status to our status
    let orderStatus = status.toLowerCase()

    // HitPay uses "completed" for successful payments, we use "paid"
    if (orderStatus === "completed") {
      orderStatus = "paid"
    }

    // Update the order status in Supabase
    const supabase = await createClient()
    const { error, data: orderData } = await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("id", reference_number)
      .select("is_bulk_order")
      .single()

    if (error) {
      console.error("Error updating order status:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    console.log(`Updated order ${reference_number} status to ${orderStatus}`)

    // If payment is successful, create a Detrack order
    if (orderStatus === "paid") {
      console.log(`Payment successful for order ${reference_number}, creating Detrack order`)

      // Create Detrack order asynchronously to avoid blocking the webhook response
      createDetrackOrder(reference_number)
        .then((result) => {
          console.log(`Detrack order creation result:`, result)

          // For bulk orders, also update the status of each parcel
          if (orderData?.is_bulk_order) {
            // Update all parcels for this order to have the same status
            supabase
              .from("parcels")
              .update({ status: orderStatus })
              .eq("order_id", reference_number)
              .then(({ error }) => {
                if (error) {
                  console.error(`Error updating parcel statuses for bulk order ${reference_number}:`, error)
                } else {
                  console.log(`Updated status for all parcels in bulk order ${reference_number}`)
                }
              })
          }
        })
        .catch((error) => {
          console.error(`Error creating Detrack order:`, error)
        })
    }

    // Return a 200 response to acknowledge receipt of the webhook
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Validates the HMAC signature according to HitPay's documentation
 */
function validateHmac(formData: Record<string, string>, saltKey: string): boolean {
  try {
    // Create a copy of the form data without the hmac
    const { hmac, ...dataWithoutHmac } = formData

    // Create an array of key-value pairs
    const hmacSource: Record<string, string> = {}

    // Concatenate each key with its value
    Object.entries(dataWithoutHmac).forEach(([key, value]) => {
      hmacSource[key] = `${key}${value}`
    })

    // Sort by key alphabetically
    const sortedKeys = Object.keys(hmacSource).sort()

    // Concatenate all values in the sorted order
    const concatenatedString = sortedKeys.map((key) => hmacSource[key]).join("")

    // Generate HMAC-SHA256 signature
    const calculatedHmac = crypto.createHmac("sha256", saltKey).update(concatenatedString).digest("hex")

    console.log("Calculated HMAC:", calculatedHmac)
    console.log("Received HMAC:", hmac)

    // Compare the calculated HMAC with the received HMAC
    return calculatedHmac === hmac
  } catch (error) {
    console.error("Error validating HMAC:", error)
    return false
  }
}

