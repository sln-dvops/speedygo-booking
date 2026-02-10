"use server"

import { createClient } from "@/utils/supabase/server"

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = await createClient()

    // Check if this is a bulk order (we'll need to update parcels too)
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("type, id")
      .eq("short_id", orderId)
      .single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return { success: false, error: orderError.message }
    }

    const isBulkOrder = orderData.type === "bulk"
    const fullOrderId = orderData.id // Get the full UUID for database operations

    // Update the order status
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", fullOrderId) // Use full UUID for database operations

    if (error) {
      console.error("Error updating order status:", error)
      return { success: false, error: error.message }
    }

    // For bulk orders, update all associated parcels
    if (isBulkOrder) {
      console.log(`Updating parcel statuses for bulk order ${orderId}`)
      const { error: parcelUpdateError } = await supabase
        .from("parcels")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("order_id", fullOrderId) // Use full UUID for database operations

      if (parcelUpdateError) {
        console.error(`Error updating parcel statuses for bulk order ${orderId}:`, parcelUpdateError)
        return { success: false, error: parcelUpdateError.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
