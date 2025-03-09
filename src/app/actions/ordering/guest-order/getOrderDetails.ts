"use server"

import { createClient } from "@supabase/supabase-js"
import type { OrderWithParcels } from "@/types/order"
import type { ParcelDimensions } from "@/types/pricing"

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

export async function getOrderDetails(orderId: string): Promise<OrderWithParcels | null> {
  try {
    // Fetch the order details
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return null
    }

    if (!order) {
      console.error("Order not found")
      return null
    }

    // Fetch the parcels for this order
    const { data: parcels, error: parcelsError } = await supabase.from("parcels").select("*").eq("order_id", orderId)

    if (parcelsError) {
      console.error("Error fetching parcels:", parcelsError)
      return null
    }

    // Check if this is a bulk order
    const { data: bulkOrder, error: bulkOrderError } = await supabase
      .from("bulk_orders")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle()

    if (bulkOrderError) {
      console.error("Error fetching bulk order:", bulkOrderError)
      // Continue without bulk order data
    }

    // Map the database fields to our application model
    const orderWithParcels: OrderWithParcels = {
      orderNumber: order.id,
      senderName: order.sender_name,
      senderAddress: order.sender_address,
      senderContactNumber: order.sender_contact_number,
      senderEmail: order.sender_email,
      recipientName: order.recipient_name,
      recipientAddress: order.recipient_address,
      recipientContactNumber: order.recipient_contact_number,
      recipientEmail: order.recipient_email,
      recipientLine1: order.recipient_line1,
      recipientLine2: order.recipient_line2,
      recipientPostalCode: order.recipient_postal_code,
      parcelSize: order.parcel_size || "",
      deliveryMethod: order.delivery_method,
      amount: order.amount,
      status: order.status,
      isBulkOrder: !!bulkOrder,
      parcels: parcels.map(
        (parcel): ParcelDimensions => ({
          weight: parcel.weight,
          length: parcel.length,
          width: parcel.width,
          height: parcel.height,
        }),
      ),
    }

    // Add bulk order details if available
    if (bulkOrder) {
      orderWithParcels.bulkOrder = {
        id: bulkOrder.id,
        totalParcels: bulkOrder.total_parcels,
        totalWeight: bulkOrder.total_weight,
      }
      orderWithParcels.totalParcels = bulkOrder.total_parcels
      orderWithParcels.totalWeight = bulkOrder.total_weight
    }

    return orderWithParcels
  } catch (error) {
    console.error("Error in getOrderDetails:", error)
    return null
  }
}

