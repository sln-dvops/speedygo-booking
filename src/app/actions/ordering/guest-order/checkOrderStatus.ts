"use server"

import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the anon key for client-side operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
})

export async function checkOrderStatus(orderId: string): Promise<string> {
  try {
    const { data, error } = await supabase.from("orders").select("status").eq("id", orderId).single()

    if (error) {
      console.error("Error checking order status:", error)
      throw new Error(`Failed to check order status: ${error.message}`)
    }

    return data?.status || "pending"
  } catch (error) {
    console.error("Error in checkOrderStatus:", error)
    return "pending" // Default to pending if there's an error
  }
}

