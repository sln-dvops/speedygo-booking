"use server"

import { createClient } from "@/utils/supabase/server"
import type { OrderWithParcels, RecipientDetails } from "@/types/order"
import type { ParcelDimensions } from "@/types/pricing"
import { isShortId } from "@/utils/orderIdUtils"

export async function getOrderDetails(orderIdOrShortId: string): Promise<OrderWithParcels | null> {
  try {
    const supabase = await createClient()
    let query = supabase.from("orders").select("*")

    // Check if orderIdOrShortId is a short_id or full UUID
    if (isShortId(orderIdOrShortId)) {
      // Search by short_id
      query = query.eq("short_id", orderIdOrShortId)
    } else {
      // Search by full UUID
      query = query.eq("id", orderIdOrShortId)
    }

    // Get the order details
    const { data: order, error: orderError } = await query.single()

    if (orderError) {
      console.error(`Error fetching order ${orderIdOrShortId}:`, orderError)
      return null
    }

    // IMPORTANT: Always use the full UUID (order.id) for subsequent queries
    // Get the parcels for this order using the full UUID
    const { data: parcels, error: parcelsError } = await supabase.from("parcels").select("*").eq("order_id", order.id) // Using full UUID here

    if (parcelsError) {
      console.error("Error fetching parcels:", parcelsError)
      return null
    }

    // Check if this is a bulk order - using full UUID
    const { data: bulkOrder, error: bulkOrderError } = await supabase
      .from("bulk_orders")
      .select("*")
      .eq("order_id", order.id) // Using full UUID here
      .maybeSingle()

    if (bulkOrderError) {
      console.error("Error fetching bulk order:", bulkOrderError)
    }

    // Format the parcels data
    const formattedParcels: ParcelDimensions[] = parcels.map((parcel) => ({
      weight: parcel.weight,
      length: parcel.length,
      width: parcel.width,
      height: parcel.height,
      effectiveWeight: Math.max(parcel.weight, (parcel.length * parcel.width * parcel.height) / 5000),
      pricingTier: parcel.pricing_tier, // Include the pricing tier
      id: parcel.id, // Include the parcel ID
      short_id: parcel.short_id, // Include the parcel short_id
    }))

    // Format recipient details for bulk orders
    const recipients: RecipientDetails[] = parcels.map((parcel, index) => ({
      name: parcel.recipient_name,
      address: parcel.recipient_address,
      contactNumber: parcel.recipient_contact_number,
      email: parcel.recipient_email,
      line1: parcel.recipient_line1,
      line2: parcel.recipient_line2 || undefined,
      postalCode: parcel.recipient_postal_code,
      parcelIndex: index,
      pricingTier: parcel.pricing_tier, // Include the pricing tier
    }))

    // Construct the response - use the first parcel's recipient details for individual orders
    const orderWithParcels: OrderWithParcels = {
      orderNumber: order.id,
      shortId: order.short_id, // Include the short_id in the response
      senderName: order.sender_name,
      senderAddress: order.sender_address,
      senderContactNumber: order.sender_contact_number,
      senderEmail: order.sender_email,
      // For individual orders, use the first parcel's recipient details
      recipientName: parcels[0].recipient_name,
      recipientAddress: `${parcels[0].recipient_line1}, ${parcels[0].recipient_line2 || ""}, Singapore ${parcels[0].recipient_postal_code}`,
      recipientContactNumber: parcels[0].recipient_contact_number,
      recipientEmail: parcels[0].recipient_email,
      recipientLine1: parcels[0].recipient_line1,
      recipientLine2: parcels[0].recipient_line2 || undefined,
      recipientPostalCode: parcels[0].recipient_postal_code,
      parcelSize: parcels[0].parcel_size, // Add the missing parcelSize property
      deliveryMethod: order.delivery_method,
      amount: order.amount,
      status: order.status,
      isBulkOrder: order.is_bulk_order,
      parcels: formattedParcels,
      recipients: order.is_bulk_order ? recipients : undefined,
    }

    // Add bulk order details if applicable
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
    console.error("Error getting order details:", error)
    return null
  }
}
