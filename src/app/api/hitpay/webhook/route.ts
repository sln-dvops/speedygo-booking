import { NextResponse } from "next/server"
import { createDetrackJob, generateWaybill } from "@/lib/shipping"

export async function POST(request: Request) {
  const body = await request.json()

  // Verify the webhook signature (implement this based on HitPay's documentation)
  if (!verifyWebhookSignature(request)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (body.status === "completed") {
    try {
      // Retrieve order details from your database using body.reference (orderId)
      const orderDetails = await getOrderDetails(body.reference)

      // Create Detrack job
      const detrackId = await createDetrackJob(orderDetails)

      // Generate waybill
      await generateWaybill(detrackId, orderDetails)

      // Update order status in your database
      await updateOrderStatus(body.reference, "paid")

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error processing webhook:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}

function verifyWebhookSignature(request: Request) {
  // Implement webhook signature verification
  // Refer to HitPay's documentation for this
  return true
}

async function getOrderDetails(orderId: string) {
  // Implement fetching order details from your database
  return {
    /* order details */
  }
}

async function updateOrderStatus(orderId: string, status: string) {
  // Implement updating order status in your database
}

