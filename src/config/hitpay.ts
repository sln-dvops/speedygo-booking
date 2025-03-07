import type { OrderDetails, HitPayRequestBody } from "@/types/order"

export const createHitPayRequestBody = (amount: number, orderDetails: OrderDetails): HitPayRequestBody => {
  return {
    amount,
    currency: "SGD",
    payment_methods: ["paynow_online"], // Add other payment methods as needed
    email: orderDetails.senderEmail,
    name: orderDetails.senderName,
    phone: orderDetails.senderContactNumber,
    reference_number: orderDetails.orderNumber || "",
    redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
    webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/hitpay/webhook`,
    purpose: "Speedy Xpress Delivery",
    send_email: true,
    send_sms: false,
    allow_repeated_payments: false,
    address: {
      line1: orderDetails.senderAddress.split(",")[0] || "",
      line2: orderDetails.senderAddress.split(",")[1] || "",
      postal_code: orderDetails.senderAddress.split(",").pop()?.trim() || "",
      city: "Singapore",
      state: "Singapore",
      country: "SG",
    },
    // Removed recipient_address
  }
}

