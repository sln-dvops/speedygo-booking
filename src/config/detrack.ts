/**
 * Detrack API configuration and utility functions
 */
import { type DetrackConfig, type DetrackJob, DetrackJobType } from "@/types/detrack"
import type { OrderWithParcels } from "@/types/order"

/**
 * Detrack API configuration
 */
export const detrackConfig: DetrackConfig = {
  apiKey: process.env.DETRACK_API_KEY || "",
  apiUrl: process.env.DETRACK_API_URL || "",
  webhookSecret: process.env.DETRACK_WEBHOOK_SECRET,
}

/**
 * Converts our order data to Detrack job format
 */
export function convertOrderToDetrackJob(order: OrderWithParcels): DetrackJob {
  // Get the first parcel for individual orders or handle bulk orders
  const firstParcel = order.parcels[0]

  // Basic job data
  const job: DetrackJob = {
    type: DetrackJobType.DELIVERY,
    // Use our order number as the DO number - this is the key identifier for retrieving status later
    do_number: order.orderNumber || "",
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    address: order.recipientAddress,

    // Order details
    order_number: order.orderNumber,
    tracking_number: order.orderNumber, // Use order number as tracking number

    // Contact details
    deliver_to_collect_from: order.recipientName,
    phone_number: order.recipientContactNumber,
    notify_email: order.recipientEmail,

    // Address details
    address_1: order.recipientLine1,
    address_2: order.recipientLine2 || "",
    postal_code: order.recipientPostalCode,
    zone: order.senderAddress,

    // Sender details - using pick_up fields
    pick_up_from: order.senderName,
    pick_up_address: order.senderAddress,
    pick_up_contact: order.senderContactNumber,
    pick_up_email: order.senderEmail,

    // Seller/Shipper details - these worked
    sender_name: order.senderName,
    sender_phone_number: order.senderContactNumber,

    // Try different variations for sender address
    sender_address_1: order.senderAddress,
    sender_address_line_1: order.senderAddress,
    shipper_address: order.senderAddress,
    vendor_address: order.senderAddress,
    from_address: order.senderAddress,
    billing_address: order.senderAddress, // Set billing address to sender address

    // Parcel details
    weight: firstParcel.weight,
    parcel_length: firstParcel.length,
    parcel_width: firstParcel.width,
    parcel_height: firstParcel.height,

    // Additional details
    instructions: `Delivery Method: ${order.deliveryMethod === "atl" ? "Authorized to Leave" : "Hand to Hand"}`,
    service_type: order.deliveryMethod === "atl" ? "Standard" : "Premium",

    // Webhook for status updates
    webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/detrack/webhook`,
  }

  // Add items for each parcel
  if (order.parcels.length > 0) {
    job.items = order.parcels.map((parcel, index) => {
      const recipient = order.recipients?.find((r) => r.parcelIndex === index)

      return {
        description: `Parcel ${index + 1}`,
        quantity: 1,
        weight: parcel.weight,
        comments: recipient ? `For: ${recipient.name}` : undefined,
      }
    })
  }

  return job
}

/**
 * Creates headers for Detrack API requests
 */
export function createDetrackHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-API-KEY": detrackConfig.apiKey,
  }
}

