/**
 * Detrack API V2 Type Definitions
 * Based on the official Detrack API documentation
 */

// Enum for job types
export enum DetrackJobType {
    DELIVERY = "Delivery",
    COLLECTION = "Collection",
  }
  
  // Enum for common job statuses
  export enum DetrackJobStatus {
    PENDING = "pending",
    ASSIGNED = "assigned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
  }
  
  /**
   * Represents an item in a Detrack job
   */
  export interface DetrackItem {
    // Required fields (at least one of sku or description is required)
    sku?: string
    description?: string
  
    // Optional fields
    purchase_order_number?: string
    batch_number?: string
    expiry_date?: string
    comments?: string
    quantity?: number
    unit_of_measure?: string
    checked?: boolean
    actual_quantity?: number
    inbound_quantity?: number
    unload_time_estimate?: string
    unload_time_actual?: string
    follow_up_quantity?: number
    follow_up_reason?: string
    rework_quantity?: number
    rework_reason?: string
    weight?: number
  
    // Read-only fields
    id?: string
    photo_url?: string
    serial_numbers?: string[]
  }
  
  /**
   * Represents a milestone in a Detrack job
   */
  export interface DetrackMilestone {
    status: string
    assign_to?: string
    reason?: string
    pod_at?: string // Time format
    created_at?: string // Time format
    user_name?: string
  }
  
  /**
   * Main Detrack Job interface
   */
  export interface DetrackJob {
    // Required fields
    type: DetrackJobType
    do_number: string
    date: string // Date format YYYY-MM-DD
    address: string
  
    // Common fields that we'll likely use
    primary_job_status?: string
    status?: string
    tracking_number?: string
    order_number?: string
    deliver_to_collect_from?: string
    phone_number?: string
    instructions?: string
    notify_email?: string
    webhook_url?: string
  
    // Address details
    company_name?: string
    address_1?: string
    address_2?: string
    address_3?: string
    postal_code?: string
    city?: string
    state?: string
    country?: string
    address_lat?: string
    address_lng?: string
  
    // Parcel details
    weight?: number
    parcel_width?: number
    parcel_length?: number
    parcel_height?: number
    cubic_meter?: number
  
    // Quantity details
    boxes?: number
    cartons?: number
    pieces?: number
    envelopes?: number
    pallets?: number
    bins?: number
    trays?: number
    bundles?: number
    rolls?: number
  
    // Pickup details
    pick_up_from?: string
    pick_up_time?: string
    pick_up_address?: string
    pick_up_address_1?: string
    pick_up_address_2?: string
    pick_up_address_3?: string
    pick_up_city?: string
    pick_up_state?: string
    pick_up_country?: string
    pick_up_postal_code?: string
    pick_up_lat?: string
    pick_up_lng?: string
  
    // Pricing details
    job_price?: number
    insurance_price?: number
    insurance_coverage?: string
    total_price?: number
    payment_mode?: string
    payment_amount?: number
  
    // Assignment details
    assign_to?: string
    job_owner?: string
  
    // Scheduling details
    start_date?: string
    job_release_time?: string
    job_time?: string
    time_window?: string
    job_received_date?: string
    eta_time?: string
  
    // Other details
    remarks?: string
    service_type?: string
    vehicle_type?: string
  
    // Arrays
    items?: DetrackItem[]
    milestones?: DetrackMilestone[]
  
    // Additional fields
    [key: string]: any // Allow for any additional fields
  }
  
  /**
   * Response from Detrack API when creating a job
   */
  export interface DetrackCreateJobResponse {
    data: {
      job: DetrackJob
    }
    message: string
    status: number
  }
  
  /**
   * Response from Detrack API when fetching jobs
   */
  export interface DetrackGetJobsResponse {
    data: {
      jobs: DetrackJob[]
    }
    message: string
    status: number
    pagination?: {
      total: number
      count: number
      per_page: number
      current_page: number
      total_pages: number
    }
  }
  
  /**
   * Configuration for Detrack API
   */
  export interface DetrackConfig {
    apiKey: string
    baseUrl: string
    webhookSecret?: string
  }
  
  /**
   * Default configuration for Detrack API
   */
  export const DEFAULT_DETRACK_CONFIG: DetrackConfig = {
    apiKey: process.env.DETRACK_API_KEY || "",
    baseUrl: "https://app.detrack.com/api/v2",
    webhookSecret: process.env.DETRACK_WEBHOOK_SECRET,
  }
  
  /**
   * Maps our order status to Detrack job status
   */
  export function mapOrderStatusToDetrackStatus(orderStatus: string): string {
    switch (orderStatus) {
      case "paid":
        return "assigned"
      case "processing":
        return "in_progress"
      case "delivered":
        return "completed"
      case "failed":
        return "failed"
      case "cancelled":
        return "cancelled"
      default:
        return "pending"
    }
  }
  
  /**
   * Maps Detrack job status to our order status
   */
  export function mapDetrackStatusToOrderStatus(detrackStatus: string): string {
    switch (detrackStatus) {
      case "assigned":
        return "paid"
      case "in_progress":
        return "processing"
      case "completed":
        return "delivered"
      case "failed":
        return "failed"
      case "cancelled":
        return "cancelled"
      default:
        return "pending"
    }
  }
  
  