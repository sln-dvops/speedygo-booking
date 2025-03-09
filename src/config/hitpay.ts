import type { OrderDetails, HitPayRequestBody } from "@/types/order"

export function createHitPayRequestBody(amount: number, orderDetails: OrderDetails): HitPayRequestBody {
  // Get the base URL from environment variable or use a default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  // If a custom redirect URL is provided in orderDetails, use that
  // Otherwise, construct the default one
  const redirectUrl = orderDetails.redirectUrl || `${baseUrl}/api/payment/success`

  return {
    amount: amount,
    currency: "SGD",
    payment_methods: ["paynow_online", "card"],
    email: orderDetails.senderEmail,
    name: orderDetails.senderName,
    phone: orderDetails.senderContactNumber,
    reference_number: orderDetails.orderNumber || "",
    redirect_url: redirectUrl,
    webhook: `${baseUrl}/api/hitpay/webhook`,
    purpose: `Speedy Xpress Delivery - Order ${orderDetails.orderNumber}`,
    allow_repeated_payments: false,
    send_email: true,
    send_sms: false,
  }
}

