"use server"

import { createClient } from "@/utils/supabase/server"
import { convertOrderToDetrackJob, createDetrackHeaders, detrackConfig } from "@/config/detrack"
import type { OrderWithParcels, RecipientDetails } from "@/types/order"
import type { ParcelDimensions } from "@/types/pricing"
import { calculateVolumetricWeight, getPricingTier } from "@/types/pricing"
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
  detrack_job_id?: string
  short_id?: string
}

/**
 * Creates a Detrack order for a paid order
 * Works with both individual and bulk orders
 */
export async function createDetrackOrder(
  orderId: string,
): Promise<{ success: boolean; message: string; detrackId?: string; detrackIds?: string[] }> {
  try {
    // Check if Detrack API key and URL are configured
    if (!detrackConfig.apiKey) {
      console.error("Detrack API key is not configured")
      return { success: false, message: "Detrack API key is not configured" }
    }

    if (!detrackConfig.apiUrl) {
      console.error("Detrack API URL is not configured")
      return { success: false, message: "Detrack API URL is not configured" }
    }

    // Initialize Supabase client
    const supabase = await createClient()

    // 1. Fetch the order details - using short_id instead of id
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("short_id", orderId)
      .single()

    if (orderError || !orderData) {
      console.error("Error fetching order:", orderError)
      return { success: false, message: `Order not found: ${orderError?.message || "Unknown error"}` }
    }

    // Get the full UUID for database operations
    const fullOrderId = orderData.id

    // 2. Check if order is already in Detrack
    if (orderData.detrack_id && !orderData.is_bulk_order) {
      return { success: true, message: "Order already exists in Detrack", detrackId: orderData.detrack_id }
    }

    // 3. Fetch parcels for this order - using the full UUID for this query
    const { data: parcelsData, error: parcelsError } = await supabase
      .from("parcels")
      .select("*")
      .eq("order_id", fullOrderId)

    if (parcelsError || !parcelsData || parcelsData.length === 0) {
      console.error("Error fetching parcels:", parcelsError)
      return { success: false, message: `No parcels found for order: ${parcelsError?.message || "Unknown error"}` }
    }

    // Check if all parcels already have Detrack job IDs for bulk orders
    if (orderData.is_bulk_order) {
      const allParcelsHaveDetrackIds = parcelsData.every((parcel) => parcel.detrack_job_id)
      if (allParcelsHaveDetrackIds) {
        const detrackIds = parcelsData.map((parcel) => parcel.detrack_job_id)
        return {
          success: true,
          message: "All parcels already exist in Detrack",
          detrackIds,
        }
      }
    }

    // 4. Convert database data to our internal types
    const parcels: ParcelDimensions[] = parcelsData.map((parcel: ParcelData) => {
      // Use the functions from pricing.ts for calculations
      const volumetricWeight = calculateVolumetricWeight(parcel.length, parcel.width, parcel.height)

      // Get the pricing tier information (which includes effectiveWeight)
      const tierInfo = getPricingTier({
        weight: parcel.weight,
        length: parcel.length,
        width: parcel.width,
        height: parcel.height,
      })

      return {
        id: parcel.id,
        short_id: parcel.short_id, // Include short_id in the parcel data
        weight: parcel.weight,
        length: parcel.length,
        width: parcel.width,
        height: parcel.height,
        effectiveWeight: Math.max(parcel.weight, volumetricWeight),
        pricingTier: tierInfo.tier.name,
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
      orderNumber: orderId, // Use the short_id for external references
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
        .eq("order_id", fullOrderId)
        .single()

      if (!bulkOrderError && bulkOrderData) {
        order.bulkOrder = {
          id: bulkOrderData.id,
          totalParcels: bulkOrderData.total_parcels,
          totalWeight: bulkOrderData.total_weight,
        }
      }
    }

    // Set the date to Singapore time (UTC+8)
    const now = new Date()
    const sgDate = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    const formattedDate = sgDate.toISOString().split("T")[0] // YYYY-MM-DD format

    // 7. Handle different logic for bulk vs individual orders
    if (orderData.is_bulk_order) {
      // For bulk orders, create a separate Detrack job for each parcel
      const detrackIds: string[] = []
      const detrackJobPromises = parcelsData.map(async (parcel, index) => {
        // Skip parcels that already have a Detrack job ID
        if (parcel.detrack_job_id) {
          detrackIds.push(parcel.detrack_job_id)
          return { success: true, parcelId: parcel.id, detrackId: parcel.detrack_job_id }
        }

        // Create a modified order object for this specific parcel
        const parcelOrder = {
          ...order,
          // Use the parcel's short_id as the order number for Detrack
          orderNumber: parcel.short_id || `SPDY${parcel.id.slice(-12)}`,
          // Use this specific parcel's recipient details
          recipientName: parcel.recipient_name,
          recipientAddress: parcel.recipient_address,
          recipientContactNumber: parcel.recipient_contact_number,
          recipientEmail: parcel.recipient_email,
          recipientLine1: parcel.recipient_line1,
          recipientLine2: parcel.recipient_line2 || undefined,
          recipientPostalCode: parcel.recipient_postal_code,
          // Include only this parcel
          parcels: [parcels[index]],
        }

        // Convert to Detrack job format
        const detrackJob: DetrackJob = convertOrderToDetrackJob(parcelOrder)

        // Set the date in the job to Singapore time
        detrackJob.date = formattedDate
        detrackJob.start_date = formattedDate

        // Use the parcel's short_id as the DO number for Detrack
        detrackJob.do_number = parcel.short_id || `SPDY${parcel.id.slice(-12)}`
        detrackJob.tracking_number = parcel.short_id || `SPDY${parcel.id.slice(-12)}`

        // Add reference to the parent order
        detrackJob.order_number = orderId // Use short_id for external references

        try {
          // Send the job to Detrack API
          // Add timeout to fetch request
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

          const response = await fetch(detrackConfig.apiUrl, {
            method: "POST",
            headers: createDetrackHeaders(),
            body: JSON.stringify({ data: detrackJob }),
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId))

          console.log(`Detrack API response status for parcel ${parcel.id}: ${response.status} ${response.statusText}`)

          const responseText = await response.text()

          if (!response.ok) {
            return {
              success: false,
              parcelId: parcel.id,
              error: `Detrack API error: ${response.status} ${response.statusText} - ${responseText}`,
            }
          }

          // Parse the response as JSON
          let detrackResponse
          try {
            detrackResponse = JSON.parse(responseText)
          } catch (error) {
            console.error(`Error parsing Detrack API response for parcel ${parcel.id}:`, error)
            return {
              success: false,
              parcelId: parcel.id,
              error: `Error parsing Detrack API response: ${error instanceof Error ? error.message : String(error)}`,
            }
          }

          // Extract the Detrack ID from the response
          const detrackId = detrackResponse.data?.id

          if (!detrackId) {
            console.error(`Detrack API did not return an ID for parcel ${parcel.id}`)
            return {
              success: false,
              parcelId: parcel.id,
              error: "Detrack API did not return an ID",
            }
          }

          // Update the parcel with the Detrack job ID
          const { error: updateError } = await supabase
            .from("parcels")
            .update({ detrack_job_id: detrackId })
            .eq("id", parcel.id)

          if (updateError) {
            console.error(`Error updating parcel ${parcel.id} with Detrack job ID:`, updateError)
          }

          detrackIds.push(detrackId)
          return { success: true, parcelId: parcel.id, detrackId }
        } catch (error) {
          console.error(`Error creating Detrack job for parcel ${parcel.id}:`, error)
          return {
            success: false,
            parcelId: parcel.id,
            error: `Error: ${error instanceof Error ? error.message : String(error)}`,
          }
        }
      })

      // Wait for all Detrack job creations to complete
      const results = await Promise.all(detrackJobPromises)

      // Check if all jobs were created successfully
      const allSuccessful = results.every((result) => result.success)

      // Update the order with a flag indicating Detrack jobs were created
      if (detrackIds.length > 0) {
        const { error: updateError } = await supabase
          .from("orders")
          .update({ detrack_id: "BULK_ORDER_MULTIPLE_JOBS" })
          .eq("id", fullOrderId) // Use full UUID for database operations

        if (updateError) {
          console.error("Error updating order with Detrack flag:", updateError)
        }
      }

      if (allSuccessful) {
        return {
          success: true,
          message: `Created ${detrackIds.length} Detrack jobs for bulk order successfully`,
          detrackIds,
        }
      } else {
        const failedCount = results.filter((result) => !result.success).length
        return {
          success: detrackIds.length > 0, // Partial success if at least one job was created
          message: `Created ${detrackIds.length} Detrack jobs, but ${failedCount} failed`,
          detrackIds: detrackIds.length > 0 ? detrackIds : undefined,
        }
      }
    } else {
      // For individual orders, create a single Detrack job

      // Get the first parcel's short_id to use as tracking number
      const firstParcel = parcelsData[0]
      const trackingNumber = firstParcel.short_id || `SPDY${firstParcel.id.slice(-12)}`

      // Create a modified order object with the tracking number and parcel ID as order number
      const orderWithTracking = {
        ...order,
        orderNumber: trackingNumber, // Use short_id as DO number for API calls
        trackingNumber: trackingNumber, // Use short_id as tracking number for user reference
      }

      const detrackJob: DetrackJob = convertOrderToDetrackJob(orderWithTracking)

      // Set the date in the job to Singapore time
      detrackJob.date = formattedDate
      detrackJob.start_date = formattedDate

      // Use the full API URL directly from the environment variable
      const apiUrl = detrackConfig.apiUrl

      const headers = createDetrackHeaders()

      try {
        // Add timeout to fetch request
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ data: detrackJob }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId))

        console.log(`Detrack API response status: ${response.status} ${response.statusText}`)

        const responseText = await response.text()

        if (!response.ok) {
          console.error(`Detrack API error: ${response.status} ${response.statusText} - ${responseText}`)
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
          console.error("Detrack API did not return an ID")
          return { success: false, message: "Detrack API did not return an ID" }
        }

        // 10. Extract Detrack item IDs and update parcels
        const detrackItems = detrackResponse.data?.items || []

        // Update each parcel with its corresponding Detrack item ID
        const updatePromises = parcelsData.map(async (parcel: ParcelData, index: number) => {
          if (index < detrackItems.length) {
            const detrackItem = detrackItems[index]

            const { error } = await supabase
              .from("parcels")
              .update({
                detrack_item_id: detrackItem.id,
                detrack_job_id: detrackId, // Also store the job ID for individual orders
              })
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
        const { error: updateError } = await supabase
          .from("orders")
          .update({ detrack_id: detrackId })
          .eq("id", fullOrderId) // Use full UUID for database operations

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
    }
  } catch (error) {
    console.error("Error creating Detrack order:", error)
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
