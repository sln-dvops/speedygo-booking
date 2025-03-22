"use server"

import { createClient } from "@/utils/supabase/server"
import { convertOrderToDetrackJob, createDetrackHeaders, detrackConfig } from "@/config/detrack"
import type { OrderWithParcels, RecipientDetails } from "@/types/order"
import type { ParcelDimensions } from "@/types/pricing"
import type { DetrackJob } from "@/types/detrack"

interface ParcelData {
  id: string
  order_id: string
  weight: number
  length: number
  width: number
  height: number
  parcel_size: string
  pricing_tier?: string
  recipient_name: string
  recipient_address: string
  recipient_contact_number: string
  recipient_email: string
  recipient_line1: string
  recipient_line2?: string | null
  recipient_postal_code: string
  created_at?: string
}

/**
 * Creates a Detrack order for a paid order
 * Works with both individual and bulk orders
 */
export async function createDetrackOrder(
  orderId: string,
): Promise<{ success: boolean; message: string; detrackId?: string }> {
  try {
    console.log(`Creating Detrack order for order ID: ${orderId}`)

    // Check if Detrack API key and URL are configured
    if (!detrackConfig.apiKey) {
      console.error("Detrack API key is not configured")
      return { success: false, message: "Detrack API key is not configured" }
    }

    if (!detrackConfig.apiUrl) {
      console.error("Detrack API URL is not configured")
      return { success: false, message: "Detrack API URL is not configured" }
    }

    console.log(`Using Detrack API key: ${detrackConfig.apiKey.substring(0, 4)}...`)
    console.log(`Using Detrack API URL: ${detrackConfig.apiUrl}`)

    // Initialize Supabase client
    const supabase = await createClient()

    // 1. Fetch the order details
    const { data: orderData, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !orderData) {
      console.error("Error fetching order:", orderError)
      return { success: false, message: `Order not found: ${orderError?.message || "Unknown error"}` }
    }

    // 2. Check if order is already in Detrack
    if (orderData.detrack_id) {
      console.log(`Order ${orderId} already has Detrack ID: ${orderData.detrack_id}`)
      return { success: true, message: "Order already exists in Detrack", detrackId: orderData.detrack_id }
    }

    // 3. Fetch parcels for this order
    const { data: parcelsData, error: parcelsError } = await supabase
      .from("parcels")
      .select("*")
      .eq("order_id", orderId)

    if (parcelsError || !parcelsData || parcelsData.length === 0) {
      console.error("Error fetching parcels:", parcelsError)
      return { success: false, message: `No parcels found for order: ${parcelsError?.message || "Unknown error"}` }
    }

    // 4. Convert database data to our internal types
    const parcels: ParcelDimensions[] = parcelsData.map((parcel: ParcelData) => {
      // Calculate volumetric weight
      const volumetricWeight = (parcel.length * parcel.width * parcel.height) / 5000

      // Use the higher of actual weight and volumetric weight
      const effectiveWeight = Math.max(parcel.weight, volumetricWeight)

      return {
        weight: parcel.weight,
        length: parcel.length,
        width: parcel.width,
        height: parcel.height,
        effectiveWeight,
      }
    })

    // Create recipients array for bulk orders
    const recipients: RecipientDetails[] = parcelsData.map((parcel: ParcelData, index: number) => ({
      name: parcel.recipient_name,
      contactNumber: parcel.recipient_contact_number,
      email: parcel.recipient_email,
      address: parcel.recipient_address,
      line1: parcel.recipient_line1,
      line2: parcel.recipient_line2 || "",
      postalCode: parcel.recipient_postal_code,
      parcelIndex: index,
      pricingTier: parcel.pricing_tier,
    }))

    // 5. Create the OrderWithParcels object
    const order: OrderWithParcels = {
      orderNumber: orderId,
      senderName: orderData.sender_name,
      senderAddress: orderData.sender_address,
      senderContactNumber: orderData.sender_contact_number,
      senderEmail: orderData.sender_email,
      // For individual orders, use the first parcel's recipient
      recipientName: parcelsData[0].recipient_name,
      recipientAddress: parcelsData[0].recipient_address,
      recipientContactNumber: parcelsData[0].recipient_contact_number,
      recipientEmail: parcelsData[0].recipient_email,
      recipientLine1: parcelsData[0].recipient_line1,
      recipientLine2: parcelsData[0].recipient_line2 || undefined,
      recipientPostalCode: parcelsData[0].recipient_postal_code,
      parcelSize: parcelsData[0].parcel_size,
      deliveryMethod: orderData.delivery_method,
      amount: orderData.amount,
      status: orderData.status,
      isBulkOrder: orderData.is_bulk_order,
      parcels,
      recipients: orderData.is_bulk_order ? recipients : undefined,
    }

    // 6. If it's a bulk order, fetch the bulk order details
    if (orderData.is_bulk_order) {
      const { data: bulkOrderData, error: bulkOrderError } = await supabase
        .from("bulk_orders")
        .select("*")
        .eq("order_id", orderId)
        .single()

      if (!bulkOrderError && bulkOrderData) {
        order.bulkOrder = {
          id: bulkOrderData.id,
          totalParcels: bulkOrderData.total_parcels,
          totalWeight: bulkOrderData.total_weight,
        }
      }
    }

    // 7. Convert our order to Detrack job format
    // Note: We use the order ID as the DO number in Detrack, which is what we'll use to fetch status later
    const detrackJob: DetrackJob = convertOrderToDetrackJob(order)

    // 8. Send the job to Detrack API
    console.log("Sending job to Detrack:", JSON.stringify(detrackJob, null, 2))

    // Use the full API URL directly from the environment variable
    const apiUrl = detrackConfig.apiUrl
    console.log(`Detrack API URL: ${apiUrl}`)

    const headers = createDetrackHeaders()
    console.log(`Detrack API Headers: ${JSON.stringify(headers, null, 2)}`)

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ data: detrackJob }),
      })

      console.log(`Detrack API response status: ${response.status} ${response.statusText}`)

      const responseText = await response.text()
      console.log(`Detrack API response body: ${responseText}`)

      if (!response.ok) {
        return {
          success: false,
          message: `Detrack API error: ${response.status} ${response.statusText} - ${responseText}`,
        }
      }

      // Parse the response as JSON
      let detrackResponse
      try {
        detrackResponse = JSON.parse(responseText)
      } catch (error) {
        console.error("Error parsing Detrack API response:", error)
        return {
          success: false,
          message: `Error parsing Detrack API response: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

      // 9. Extract the Detrack ID from the response
      const detrackId = detrackResponse.data?.id

      if (!detrackId) {
        return { success: false, message: "Detrack API did not return an ID" }
      }

      // 10. Extract Detrack item IDs and update parcels
      const detrackItems = detrackResponse.data?.items || []

      console.log(`Found ${detrackItems.length} Detrack items for ${parcelsData.length} parcels`)

      // Update each parcel with its corresponding Detrack item ID
      const updatePromises = parcelsData.map(async (parcel: ParcelData, index: number) => {
        if (index < detrackItems.length) {
          const detrackItem = detrackItems[index]
          console.log(`Updating parcel ${parcel.id} with Detrack item ID ${detrackItem.id}`)

          const { error } = await supabase
            .from("parcels")
            .update({ detrack_item_id: detrackItem.id })
            .eq("id", parcel.id)

          if (error) {
            console.error(`Error updating parcel ${parcel.id} with Detrack item ID:`, error)
          }
        } else {
          console.warn(`No Detrack item found for parcel at index ${index}`)
        }
      })

      // Wait for all parcel updates to complete
      await Promise.all(updatePromises)

      // 11. Update the order with the Detrack ID (we store this as a flag to indicate the order exists in Detrack)
      // Note: For status retrieval, we'll use the order ID (DO number), not this Detrack ID
      const { error: updateError } = await supabase.from("orders").update({ detrack_id: detrackId }).eq("id", orderId)

      if (updateError) {
        console.error("Error updating order with Detrack ID:", updateError)
        return {
          success: true,
          message: `Detrack order created but failed to update local order: ${updateError.message}`,
          detrackId,
        }
      }

      return {
        success: true,
        message: "Detrack order created successfully",
        detrackId,
      }
    } catch (fetchError) {
      console.error("Error making request to Detrack API:", fetchError)
      return {
        success: false,
        message: `Error making request to Detrack API: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      }
    }
  } catch (error) {
    console.error("Error creating Detrack order:", error)
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

