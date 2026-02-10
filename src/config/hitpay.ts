// Determine the API endpoint based on the environment
export const HITPAY_API_ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "https://api.hit-pay.com/v1/payment-requests"
    : "https://api.sandbox.hit-pay.com/v1/payment-requests"

export const HITPAY_WEBHOOK_PATH = "/api/hitpay/webhook"
export const HITPAY_SUCCESS_PATH = "/api/payment/success"

export function createHitPayRequestBody(orderDetails: any) {
  // Get the base URL from environment variable
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://speedyxpress.vercel.app/"

  console.log("Using HitPay API endpoint:", HITPAY_API_ENDPOINT)

  return {
    amount: orderDetails.amount,
    currency: "SGD",
    payment_methods: ["paynow_online", "card"],
    email: orderDetails.senderEmail,
    name: orderDetails.senderName,
    phone: orderDetails.senderContactNumber,
    reference_number: orderDetails.orderNumber,
    redirect_url: orderDetails.redirectUrl || `${baseUrl}${HITPAY_SUCCESS_PATH}?orderId=${orderDetails.orderNumber}`,
    webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/hitpay/webhook`,
    purpose: `Speedy Xpress Delivery - Order ${orderDetails.orderNumber}`,
    // Address removed for privacy reasons
    allow_repeated_payments: false,
    send_email: true,
    send_sms: false,
  }
}

