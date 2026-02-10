"use server"

import { createClient } from "@supabase/supabase-js"
import { createHitPayRequestBody, HITPAY_API_ENDPOINT } from "@/config/hitpay"
import type { OrderDetails, HitPayResponse, RecipientDetails } from "@/types/order"
import type { ParcelDimensions } from "@/types/pricing"
import { determinePricingTier, calculateShippingPrice } from "@/types/pricing"

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

// Update the createOrder function to handle recipients properly
export async function createOrder(
  orderDetails: OrderDetails,
  parcels: ParcelDimensions[],
  recipients?: RecipientDetails[],
) {
  try {
    console.log("Creating order with the following details:")
    console.log("Order Details:", JSON.stringify(orderDetails, null, 2))
    console.log("Parcels:", JSON.stringify(parcels, null, 2))
    console.log("Recipients:", JSON.stringify(recipients, null, 2))

    // For bulk orders, validate that we have recipient details for each parcel
    if (orderDetails.isBulkOrder && (!recipients || recipients.length !== parcels.length)) {
      throw new Error("Missing recipient details for bulk order")
    }

    // Validate required fields
    if (!orderDetails.senderName || !orderDetails.senderEmail || !orderDetails.deliveryMethod) {
      throw new Error("Missing required order details")
    }

    // Server-side price validation
    const serverCalculatedPrice = parcels.reduce((total, parcel) => {
      return total + calculateShippingPrice(parcel, orderDetails.deliveryMethod)
    }, 0)

    // Round to 2 decimal places for comparison
    const clientAmount = Math.round((orderDetails.amount || 0) * 100) / 100
    const serverAmount = Math.round(serverCalculatedPrice * 100) / 100

    // Check if the client-provided amount matches the server calculation (with small tolerance for floating point issues)
    if (Math.abs(clientAmount - serverAmount) > 0.01) {
      console.error(`Price mismatch: Client: ${clientAmount}, Server: ${serverAmount}`)
      throw new Error(`Invalid price calculation. Expected: $${serverAmount.toFixed(2)}`)
    }

    // Use the server-calculated price for the order
    const finalAmount = serverAmount

    // 1. Create the main order record
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        sender_name: orderDetails.senderName,
        sender_address: orderDetails.senderAddress,
        sender_contact_number: orderDetails.senderContactNumber,
        sender_email: orderDetails.senderEmail,
        delivery_method: orderDetails.deliveryMethod,
        amount: finalAmount, // Use the validated server-calculated price
        status: "pending",
        is_bulk_order: orderDetails.isBulkOrder || false,
      })
      .select("id")
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    const orderId = orderData.id
    console.log("Generated order ID:", orderId)

    // Fetch the short_id for this order
    const { data: orderWithShortId, error: shortIdError } = await supabase
      .from("orders")
      .select("short_id")
      .eq("id", orderId)
      .single()

    if (shortIdError) {
      console.error("Error fetching short_id:", shortIdError)
      throw new Error(`Failed to fetch short_id: ${shortIdError.message}`)
    }

    const orderShortId = orderWithShortId.short_id
    console.log("Order short ID:", orderShortId)

    // 2. If it's a bulk order, create a bulk_orders record
    let bulkOrderId = null
    if (orderDetails.isBulkOrder && parcels.length > 1) {
      const totalWeight = parcels.reduce((sum, parcel) => sum + parcel.weight, 0)

      const { data: bulkOrderData, error: bulkOrderError } = await supabase
        .from("bulk_orders")
        .insert({
          order_id: orderId,
          total_parcels: parcels.length,
          total_weight: totalWeight,
        })
        .select("id")
        .single()

      if (bulkOrderError) {
        console.error("Bulk order creation error:", bulkOrderError)
        // We'll continue even if this fails - it's not critical
      }

      if (bulkOrderData) {
        bulkOrderId = bulkOrderData.id
        console.log("Generated bulk order ID:", bulkOrderId)
      }
    }

    // 3. Create parcel records with recipient details
    const parcelInsertPromises = []

    for (let i = 0; i < parcels.length; i++) {
      const parcel = parcels[i]

      // For bulk orders, get the recipient details for this parcel
      let recipientName = orderDetails.recipientName
      let recipientAddress = orderDetails.recipientAddress
      let recipientContactNumber = orderDetails.recipientContactNumber
      let recipientEmail = orderDetails.recipientEmail
      let recipientLine1 = orderDetails.recipientLine1
      let recipientLine2 = orderDetails.recipientLine2 || ""
      let recipientPostalCode = orderDetails.recipientPostalCode

      // If this is a bulk order with multiple recipients, use the recipient data for this parcel
      if (orderDetails.isBulkOrder && recipients && recipients.length > 0) {
        const recipient = recipients.find((r) => r.parcelIndex === i)
        if (recipient) {
          recipientName = recipient.name
          recipientAddress = recipient.address
          recipientContactNumber = recipient.contactNumber
          recipientEmail = recipient.email
          recipientLine1 = recipient.line1
          recipientLine2 = recipient.line2 || ""
          recipientPostalCode = recipient.postalCode
        }
      }

      // Validate that we have recipient details
      if (!recipientName || !recipientAddress || !recipientContactNumber || !recipientEmail) {
        console.error(`Missing recipient details for parcel ${i + 1}`)
        throw new Error(`Missing recipient details for parcel ${i + 1}`)
      }

      // Calculate the pricing tier for this parcel
      const pricingTier = determinePricingTier(parcel)

      const parcelInsert = supabase.from("parcels").insert({
        order_id: orderId,
        bulk_order_id: bulkOrderId,
        parcel_size: `${parcel.weight}kg`,
        weight: parcel.weight,
        length: parcel.length,
        width: parcel.width,
        height: parcel.height,
        pricing_tier: pricingTier, // Store the pricing tier
        recipient_name: recipientName,
        recipient_address: recipientAddress,
        recipient_contact_number: recipientContactNumber,
        recipient_email: recipientEmail,
        recipient_line1: recipientLine1,
        recipient_line2: recipientLine2,
        recipient_postal_code: recipientPostalCode,
      })

      parcelInsertPromises.push(parcelInsert)
    }

    // Execute all parcel inserts
    const parcelResults = await Promise.all(parcelInsertPromises)

    // Check for errors
    const parcelErrors = parcelResults.filter((result) => result.error)
    if (parcelErrors.length > 0) {
      console.error("Errors creating parcels:", parcelErrors)
      // Continue anyway - we've created the order
    }

    // Create HitPay payment request
    // Update the redirect URL to include the order ID
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const redirectUrl = `${baseUrl}/order/${orderShortId}`

    const hitPayRequestBody = createHitPayRequestBody({
      ...orderDetails,
      orderNumber: orderShortId, // Use short_id instead of full UUID
      redirectUrl: redirectUrl, // Override the default redirect URL
      amount: finalAmount, // Use the validated server-calculated price
    })

    console.log("HitPay request body:", JSON.stringify(hitPayRequestBody, null, 2))
    console.log("Using HitPay API endpoint:", HITPAY_API_ENDPOINT)

    const hitPayResponse = await fetch(HITPAY_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY || "",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(hitPayRequestBody),
    })

    if (!hitPayResponse.ok) {
      const errorText = await hitPayResponse.text()
      console.error("HitPay API error response:", errorText)
      throw new Error(`HitPay API error: ${hitPayResponse.status} ${hitPayResponse.statusText}
${errorText}`)
    }

    const hitPayData: HitPayResponse = await hitPayResponse.json()
    console.log("HitPay API response:", JSON.stringify(hitPayData, null, 2))

    return {
      success: true,
      orderId,
      orderShortId,
      paymentUrl: hitPayData.url,
    }
  } catch (error) {
    console.error("Order creation failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
