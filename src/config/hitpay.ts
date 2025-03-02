export interface PaymentDetails {
    amount: number
    senderName: string
    senderAddress: string
    recipientName: string
    recipientAddress: string
    parcelSize: string | null
    collectionMethod: string | null
  }
  
  export interface HitPayRequestBody {
    amount: number
    currency: string
    email: string
    name: string
    reference: string
    redirect_url: string
    webhook: string
  }
  
  export const createHitPayRequestBody = (amount: number, name: string, reference: string): HitPayRequestBody => ({
    amount,
    currency: "SGD",
    email: "customer@example.com", // You should collect this from the customer
    name,
    reference,
    redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
    webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/hitpay/webhook`,
  })
  
  