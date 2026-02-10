/**
 * Detrack API types
 */

export interface DetrackConfig {
  apiKey: string
  apiUrl: string
  webhookSecret?: string
}

export enum DetrackJobType {
  DELIVERY = "Delivery",
  COLLECTION = "Collection",
}

export enum DetrackJobStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface DetrackJobItem {
  id?: string
  sku?: string
  purchase_order_number?: string
  batch_number?: string
  expiry_date?: string
  description?: string
  comments?: string
  quantity: number
  unit_of_measure?: string
  checked?: boolean
  actual_quantity?: number
  inbound_quantity?: number
  unload_time_estimate?: number
  unload_time_actual?: number
  follow_up_quantity?: number
  follow_up_reason?: string
  rework_quantity?: number
  rework_reason?: string
  reject_quantity?: number
  reject_reason?: string
  weight?: number
  serial_numbers?: string[]
  photo_url?: string
}

export interface DetrackJob {
  id?: string
  type: DetrackJobType
  do_number: string
  date: string
  start_date?: string
  address: string

  // Order details
  order_number?: string
  tracking_number?: string

  // Contact details
  deliver_to_collect_from: string
  phone_number: string
  notify_email?: string

  // Address details
  address_1?: string
  address_2?: string
  address_3?: string
  postal_code?: string
  city?: string
  state?: string
  country?: string
  zone?: string

  // Sender details
  pick_up_from?: string
  pick_up_address?: string
  pick_up_postal_code?: string
  pick_up_contact?: string
  pick_up_email?: string

  // Seller/Shipper details
  sender_name?: string
  sender_phone_number?: string

  // Try different variations for sender address
  sender_address?: string
  sender_address_1?: string
  sender_address_line_1?: string
  shipper_address?: string
  vendor_address?: string
  from_address?: string
  billing_address?: string

  // Parcel details
  weight?: number
  parcel_width?: number
  parcel_length?: number
  parcel_height?: number

  // Additional details
  instructions?: string
  service_type?: string

  // Webhook for status updates
  webhook_url?: string

  // Items
  items?: DetrackJobItem[]

  // Status fields (for responses)
  status?: string
  tracking_status?: string
  primary_job_status?: string

  // Timestamps (for responses)
  info_received_at?: string
  scheduled_at?: string
  at_warehouse_at?: string
  out_for_delivery_at?: string
  head_to_delivery_at?: string
  pod_at?: string
  cancelled_at?: string
  created_at?: string
  updated_at?: string
}

export interface DetrackWebhookPayload {
  id: string
  do_number: string
  status: string
  tracking_status: string
  deliver_to_collect_from: string
  address: string
  postal_code: string
  signature_file_url?: string
  photo_1_file_url?: string
  photo_2_file_url?: string
  photo_3_file_url?: string
  photo_4_file_url?: string
  photo_5_file_url?: string
  received_by_sent_by?: string
  note?: string
  reason?: string
  pod_lat?: string
  pod_lng?: string
  pod_address?: string
  pod_at?: string
}

