import type { OrderDetails, HitPayRequestBody } from "@/types/order"

export const createHitPayRequestBody = (amount: number, orderDetails: OrderDetails): HitPayRequestBody => {
  const addressParts = orderDetails.senderAddress?.split(",").map((part) => part.trim()) || []
  const postalCode = addressParts.pop() || ""
  const line2 = addressParts.pop() || ""
  const line1 = addressParts.join(", ") || ""

  return {
    amount,
    currency: "SGD",
    payment_methods: ["paynow_online"], // Add other payment methods as needed
    email: orderDetails.senderEmail || "",
    name: orderDetails.senderName || "",
    phone: orderDetails.senderContactNumber || "",
    reference_number: orderDetails.orderNumber || `ORDER-${Date.now()}`,
    redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order=${orderDetails.orderNumber}`,
    webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/hitpay/webhook`,
    allow_repeated_payments: false,
    send_email: true,
    send_sms: false,
    purpose: "Speedy Xpress Delivery",
    address: {
      line1,
      line2,
      postal_code: postalCode,
      city: "Singapore",
      state: "Singapore",
      country: "SG",
    },
  }
}

