"use server"

import { createClient } from "@/utils/supabase/server"

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

