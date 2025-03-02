import type { ParcelDimensions, DeliveryMethod } from "./pricing"

export type { ParcelDimensions, DeliveryMethod }

export interface OrderDetails {
  orderNumber: string
  senderName: string
  senderAddress: string
  senderContactNumber: string
  senderEmail: string
  recipientName: string
  recipientAddress: string
  recipientContactNumber: string
  recipientEmail: string
  parcelSize: string // Changed from ParcelSize | null to string
  deliveryMethod: DeliveryMethod | null // Changed from collectionMethod
  recipientLine1: string
  recipientLine2: string
  recipientPostalCode: string
}

export type PartialOrderDetails = Partial<OrderDetails>

export interface HitPayRequestBody {
  amount: number
  currency: string
  payment_methods: string[]
  email: string
  name: string
  phone: string
  reference_number: string
  redirect_url: string
  webhook: string
  purpose: string
  address: {
    line1: string
    line2: string
    postal_code: string
    city: string
    state: string
    country: string
  }
  recipient_address: {
    line1: string
    line2: string
    postal_code: string
    city: string
    state: string
    country: string
    recipient: string
  }
  allow_repeated_payments: boolean
  send_email: boolean
  send_sms: boolean

  // Commented out attributes (not currently used)
  // wifi_terminal_id?: string
  // staff_id?: string
  // business_location_id?: string
  // expiry_date?: string
  // expires_after?: string
  // add_admin_fee?: boolean
  // generate_qr?: boolean
}

export interface HitPayResponse {
  id: string
  name: string
  email: string
  phone: string
  amount: string
  currency: string
  status: string
  purpose: string
  reference_number: string
  payment_methods: string[]
  url: string
  redirect_url: string
  webhook: string
  send_sms: boolean
  send_email: boolean
  sms_status: string
  email_status: string
  allow_repeated_payments: boolean
  expiry_date: string | null
  created_at: string
  updated_at: string
}

