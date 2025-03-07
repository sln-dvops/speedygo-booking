"use server"

import { createClient } from "@supabase/supabase-js"
import { createHitPayRequestBody } from "@/config/hitpay"
import type { OrderDetails } from "@/types/order"
import type { ParcelDimensions } from "@/types/pricing"

// Create a Supabase client with the anon key for client-side and non-admin server-side operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
})

type PaymentInitiationDetails = {
  amount: number
  orderDetails: OrderDetails
  parcels?: ParcelDimensions[]
}

export async function initiatePayment({ amount, orderDetails, parcels = [] }: PaymentInitiationDetails) {
  try {
    console.log("Initiating payment with the following details:")
    console.log("Amount:", amount)
    console.log("Order Details:", JSON.stringify(orderDetails, null, 2))
    console.log("Parcels:", JSON.stringify(parcels, null, 2))

    // Validate required fields
    if (!orderDetails.senderEmail || !orderDetails.senderName) {
      throw new Error("Missing required order details")
    }

    // Insert the main order record
    const { data: orderData, error: orderError } = await supabase
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
        delivery_method: orderDetails.deliveryMethod,
        amount: amount,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error inserting order into Supabase:", orderError)
      throw new Error(`Failed to store order details: ${orderError.message}`)
    }

    if (!orderData) {
      throw new Error("Failed to retrieve inserted order details")
    }

    const orderId = orderData.id
    console.log("Generated order ID:", orderId)

    // If this is a bulk order, create a bulk_orders record
    let bulkOrderId = null
    if (orderDetails.isBulkOrder && parcels && parcels.length > 1) {
      const totalWeight = parcels.reduce((sum, parcel) => sum + parcel.weight, 0)

      const { data: bulkOrderData, error: bulkOrderError } = await supabase
        .from("bulk_orders")
        .insert({
          order_id: orderId,
          total_parcels: parcels.length,
          total_weight: totalWeight,
        })
        .select()
        .single()

      if (bulkOrderError) {
        console.error("Error inserting bulk order into Supabase:", bulkOrderError)
        throw new Error(`Failed to store bulk order details: ${bulkOrderError.message}`)
      }

      if (bulkOrderData) {
        bulkOrderId = bulkOrderData.id
        console.log("Generated bulk order ID:", bulkOrderId)
      }
    }

    // Insert parcel records
    if (parcels && parcels.length > 0) {
      const parcelRecords = parcels.map((parcel) => ({
        order_id: orderId,
        bulk_order_id: bulkOrderId,
        parcel_size: `${parcel.weight}kg`,
        weight: parcel.weight,
        length: parcel.length,
        width: parcel.width,
        height: parcel.height,
      }))

      const { error: parcelsError } = await supabase.from("parcels").insert(parcelRecords)

      if (parcelsError) {
        console.error("Error inserting parcels into Supabase:", parcelsError)
        // Continue with payment even if parcel insertion fails
        // We can handle this later in the webhook
      }
    }

    // Create the request body using the configuration
    const requestBody = createHitPayRequestBody(amount, {
      ...orderDetails,
      orderNumber: orderId,
    })

    console.log("HitPay request body:", JSON.stringify(requestBody, null, 2))

    // Determine the API endpoint based on the environment
    const apiEndpoint =
      process.env.NODE_ENV === "production"
        ? "https://api.hit-pay.com/v1/payment-requests"
        : "https://api.sandbox.hit-pay.com/v1/payment-requests"

    console.log("Using HitPay API endpoint:", apiEndpoint)

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
      console.error("HitPay API error response:", errorText)
      throw new Error(`Failed to initiate payment: ${response.status} ${response.statusText}
${errorText}`)
    }

    const hitpayResponse = await response.json()
    console.log("HitPay API response:", JSON.stringify(hitpayResponse, null, 2))

    return hitpayResponse.url // Return the HitPay payment URL
  } catch (error) {
    console.error("Payment initiation failed:", error)
    throw error
  }
}

