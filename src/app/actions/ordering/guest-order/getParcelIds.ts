"use server"

import { createClient } from "@/utils/supabase/server"
import { isShortId } from "@/utils/orderIdUtils"

/**
 * Server action to fetch parcel IDs for a given order
 * This keeps the database access on the server side
 */
export async function getParcelIdsForOrder(orderId: string): Promise<string[]> {
  try {
    const supabase = await createClient()

    // Check if orderId is a short_id and convert to full UUID if needed
    let fullOrderId = orderId

    if (isShortId(orderId)) {
      console.log(`${orderId} appears to be a short_id, looking up full UUID`)
      const { data: orderData, error: lookupError } = await supabase
        .from("orders")
        .select("id")
        .eq("short_id", orderId)
        .single()

      if (lookupError || !orderData) {
        console.error(`Error looking up full UUID for short_id ${orderId}:`, lookupError)
        return []
      }

      fullOrderId = orderData.id
      console.log(`Converted short_id ${orderId} to full UUID ${fullOrderId}`)
    }

    // Fetch the parcels for this order to get their IDs using the full UUID
    const { data: parcels, error } = await supabase
      .from("parcels")
      .select("id")
      .eq("order_id", fullOrderId)
      .order("created_at", { ascending: true })

    if (error || !parcels || parcels.length === 0) {
      console.error(`Error fetching parcel IDs for order ${fullOrderId}:`, error)
      return []
    }

    // Extract and return just the IDs
    return parcels.map((parcel) => parcel.id)
  } catch (error) {
    console.error("Error in getParcelIdsForOrder:", error)
    return []
  }
}

