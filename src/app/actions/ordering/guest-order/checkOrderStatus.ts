"use server"

import { createClient } from "@/utils/supabase/server"

export async function checkOrderStatus(orderId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("orders").select("status").eq("short_id", orderId).single()

    if (error) {
      console.error("Error checking order status:", error)
      return null
    }

    return data?.status
  } catch (error) {
    console.error("Error checking order status:", error)
    return null
  }
}
