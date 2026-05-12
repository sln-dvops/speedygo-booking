// Determine the API endpoint based on the environment
export const HITPAY_API_ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "https://api.hit-pay.com/v1/payment-requests"
    : "https://api.hit-pay.com/v1/payment-requests"

export const HITPAY_WEBHOOK_PATH = "/api/hitpay/webhook"
// export const HITPAY_SUCCESS_PATH = "/api/payment/success"
export const HITPAY_SUCCESS_PATH = "/order"

export function createHitPayRequestBody(orderDetails: any) {
  // Get the base URL from environment variable
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://booking.speedyxpress.co/"

  console.log("Using HitPay API endpoint:", HITPAY_API_ENDPOINT)

  return {
    amount: orderDetails.amount,
    currency: "SGD",
    payment_methods: ["paynow_online", "card"],
    // payment_methods: ["paynow_online"],
    email: orderDetails.senderEmail,
    name: orderDetails.senderName,
    phone: orderDetails.senderContactNumber,
    reference_number: orderDetails.orderNumber,
    redirect_url: orderDetails.redirectUrl ??
  (() => {
    console.warn("⚠️ redirectUrl missing, using fallback");
    return `${baseUrl}${HITPAY_SUCCESS_PATH}?orderId=${orderDetails.orderNumber}`;
  })(),
    webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/hitpay/webhook`,
    purpose: `Speedy Xpress Delivery Order`,
    // Address removed for privacy reasons
    allow_repeated_payments: false,
    send_email: true,
    send_sms: false,
  }
}


//MOCK PAYMENT TESTER ------------------------------------------------------------------------------------

// const isHitPaySandbox = process.env.HITPAY_ENV === "sandbox"

// export const HITPAY_API_ENDPOINT = isHitPaySandbox
//   ? "https://api.sandbox.hit-pay.com/v1/payment-requests"
//   : "https://api.hit-pay.com/v1/payment-requests"

// export function createHitPayRequestBody(orderDetails: any) {
//   const baseUrl =
//     process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

//   console.log("Using HitPay API endpoint:", HITPAY_API_ENDPOINT)

//   return {
//     amount: orderDetails.amount,
//     currency: "SGD",
//     payment_methods: ["paynow_online"],
//     email: orderDetails.senderEmail,
//     name: orderDetails.senderName,
//     phone: orderDetails.senderContactNumber,
//     reference_number: orderDetails.orderNumber,
//     redirect_url:
//       orderDetails.redirectUrl ??
//       (() => {
//         console.warn("⚠️ redirectUrl missing, using fallback")
//         return `${baseUrl}${HITPAY_SUCCESS_PATH}?orderId=${orderDetails.orderNumber}`
//       })(),
//     webhook: `${baseUrl}/api/hitpay/webhook`,
//     purpose: "Speedy Xpress Delivery Order",
//     allow_repeated_payments: false,
//     send_email: true,
//     send_sms: false,
//   }
// }