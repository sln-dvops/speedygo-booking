/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { createClient } from "@/utils/supabase/server"
import { detrackConfig, createDetrackHeaders } from "@/config/detrack"
import { isShortId } from "@/utils/orderIdUtils"

export interface DetrackStatusResponse {
  status: string
  trackingStatus: string
  milestones: {
    name: string
    status: "completed" | "current" | "upcoming"
    timestamp: string | null
    description: string
  }[]
  lastUpdated: string
}

/**
 * Main function to get Detrack status - determines if ID is for order or parcel
 */
export async function getDetrackStatus(idParam: string): Promise<DetrackStatusResponse | null> {
  console.log(`getDetrackStatus called for ID: ${idParam}`)
  try {
    // Initialize Supabase client
    const supabase = await createClient()
    console.log(`Supabase client initialized for ID: ${idParam}`)

    // Check if the ID is a valid UUID or short_id format
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idParam)
    const isShortIdFormat = /^SPDY[0-9a-f]{12}$/i.test(idParam)

    // If it's not a valid UUID or short_id format, it might be a Detrack ID
    // In that case, we need to find the corresponding parcel by detrack_job_id
    if (!isValidUuid && !isShortIdFormat && idParam.length > 20) {
      console.log(`ID ${idParam} appears to be a Detrack ID, looking for matching parcel`)
      const { data: parcelByDetrackId } = await supabase
        .from("parcels")
        .select("id, order_id, short_id, status")
        .eq("detrack_job_id", idParam)
        .maybeSingle()

      if (parcelByDetrackId) {
        console.log(`Found parcel with Detrack ID ${idParam}, using parcel ID: ${parcelByDetrackId.id}`)
        // Use the parcel's actual ID instead of the Detrack ID
        idParam = parcelByDetrackId.id
      } else {
        console.log(`No parcel found with Detrack ID ${idParam}`)
      }
    }

    // First, determine if this is an order ID or a parcel ID
    // Try to find it in the parcels table first
    const { data: parcelData } = await supabase
      .from("parcels")
      .select("id, order_id, short_id, status")
      .eq("id", idParam)
      .maybeSingle()

    // If found in parcels table, use the parcel workflow
    if (parcelData) {
      console.log(`ID ${idParam} found in parcels table, using parcel workflow`)
      return getDetrackStatusForParcel(idParam, parcelData)
    }

    // If not found in parcels, it's likely an order ID
    console.log(`ID ${idParam} not found in parcels table, using order workflow`)
    return getDetrackStatusForOrder(idParam, supabase)
  } catch (error) {
    console.error("Error fetching Detrack status:", error)
    return null
  }
}

/**
 * Get Detrack status for a parcel ID (recipient workflow)
 */
async function getDetrackStatusForParcel(parcelId: string, parcelData: any): Promise<DetrackStatusResponse | null> {
  console.log(`Getting Detrack status for parcel: ${parcelId}`)

  // If the parcel doesn't have a short_id yet, return a placeholder status
  if (!parcelData.short_id) {
    console.log(`Parcel ${parcelId} does not have a short_id yet`)
    return createPlaceholderStatus()
  }

  // ONLY use the parcel's short_id for Detrack API calls
  const detrackId = parcelData.short_id
  console.log(`Using short_id for Detrack API call: ${detrackId}`)

  // Check if Detrack API URL is configured
  if (!detrackConfig.apiUrl) {
    console.error("Detrack API URL is not configured")
    return null
  }

  // Fetch the delivery status from Detrack using the short_id
  const detrackData = await fetchDetrackStatus(detrackId)
  if (!detrackData) {
    return null
  }

  // Map Detrack data to our response format
  return mapDetrackDataToResponse(detrackData)
}

/**
 * Get Detrack status for an order ID (seller workflow)
 */
async function getDetrackStatusForOrder(orderId: string, supabase: any): Promise<DetrackStatusResponse | null> {
  console.log(`Getting Detrack status for order: ${orderId}`)

  // Check if it's a short_id and convert to full UUID if needed
  let fullOrderId = orderId

  if (isShortId(orderId)) {
    console.log(`${orderId} appears to be a short_id, looking up full UUID`)
    const { data: orderData, error: lookupError } = await supabase
      .from("orders")
      .select("id")
      .eq("short_id", orderId)
      .single()

    if (lookupError || !orderData) {
      console.error(`Error looking up full UUID for short_id ${orderId}:`, lookupError)
      return null
    }

    fullOrderId = orderData.id
    console.log(`Converted short_id ${orderId} to full UUID ${fullOrderId}`)
  }

  // Fetch the order to get the Detrack ID using the full UUID
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("detrack_id, status, is_bulk_order, short_id")
    .eq("id", fullOrderId)
    .single()

  console.log(`Order data fetched for ${fullOrderId}:`, orderData)
  if (orderError) {
    console.error(`Error fetching order ${fullOrderId}:`, orderError)
  }

  if (orderError || !orderData) {
    console.error("Error fetching order:", orderError)
    return null
  }

  // If order is not paid yet, return null
  if (orderData.status !== "paid") {
    console.log(`Order ${fullOrderId} is not paid yet (status: ${orderData.status}), returning null`)
    return null
  }

  // Check if this is a bulk order with multiple Detrack jobs
  if (orderData.is_bulk_order && orderData.detrack_id === "BULK_ORDER_MULTIPLE_JOBS") {
    return handleBulkOrder(fullOrderId, supabase)
  } else if (!orderData.short_id) {
    console.log(`Order ${fullOrderId} does not have a short_id yet, returning custom error status`)
    return createPlaceholderStatus()
  }

  // For regular orders, use the order's short_id for Detrack API calls
  const detrackData = await fetchDetrackStatus(orderData.short_id)
  if (!detrackData) {
    return null
  }

  // Map Detrack data to our response format
  return mapDetrackDataToResponse(detrackData)
}

/**
 * Handle bulk orders with multiple Detrack jobs
 */
async function handleBulkOrder(orderId: string, supabase: any): Promise<DetrackStatusResponse | null> {
  console.log(`Handling bulk order: ${orderId}`)

  // For bulk orders, we need to fetch the first parcel's short_id
  const { data: parcelData, error: parcelError } = await supabase
    .from("parcels")
    .select("id, short_id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  if (parcelError || !parcelData || !parcelData.short_id) {
    console.log(`No parcels with short_id found for bulk order ${orderId}`)
    return createPlaceholderStatus()
  }

  // ONLY use the parcel's short_id for Detrack API calls
  const detrackId = parcelData.short_id
  console.log(`Using short_id for bulk order Detrack API call: ${detrackId}`)

  // Fetch from Detrack API
  const detrackData = await fetchDetrackStatus(detrackId)
  if (!detrackData) {
    return null
  }

  // Map Detrack data to our response format
  return mapDetrackDataToResponse(detrackData)
}

/**
 * Fetch status from Detrack API
 */
async function fetchDetrackStatus(detrackId: string): Promise<any | null> {
  // Check if Detrack API URL is configured
  if (!detrackConfig.apiUrl) {
    console.error("Detrack API URL is not configured")
    return null
  }

  // Fetch the delivery status from Detrack
  const baseUrl = detrackConfig.apiUrl
  const apiUrl = `${baseUrl}/${detrackId}`
  console.log(`Fetching Detrack status from: ${apiUrl}`)

  // Log what ID we're using for clarity
  console.log(`Using short_id for Detrack API call: ${detrackId}`)

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: createDetrackHeaders(),
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    console.log(`Detrack API response status for ${detrackId}: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      console.error(`Detrack API error: ${response.status} ${response.statusText}`)
      return null
    }

    const detrackResponse = await response.json()
    console.log(`Detrack API response for ${detrackId}:`, JSON.stringify(detrackResponse, null, 2))

    const detrackData = detrackResponse.data

    if (!detrackData) {
      console.error("No data returned from Detrack API")
      return null
    }

    return detrackData
  } catch (error) {
    console.error(`Error fetching from Detrack API for ${detrackId}:`, error)
    return null
  }
}

/**
 * Map Detrack data to our response format
 */
function mapDetrackDataToResponse(detrackData: any): DetrackStatusResponse {
  console.log(`Mapping Detrack data to response:`, JSON.stringify(detrackData, null, 2))

  // Map Detrack status to our format
  const milestones: Array<{
    name: string
    status: "completed" | "current" | "upcoming"
    timestamp: string | null
    description: string
  }> = [
    {
      name: "Order Received",
      status: "completed",
      timestamp: detrackData.info_received_at || new Date().toISOString(),
      description: "Your order has been received and is being processed",
    },
    {
      name: "Preparing for Shipment",
      status: "upcoming",
      timestamp: detrackData.scheduled_at,
      description: "Your order is being prepared for shipment",
    },
    {
      name: "Out for Delivery",
      status: "upcoming",
      timestamp: detrackData.out_for_delivery_at,
      description: "Your order is out for delivery",
    },
    {
      name: "Delivered",
      status: "upcoming",
      timestamp: detrackData.pod_at,
      description: "Your order has been delivered",
    },
  ]

  // Update milestone statuses based on timestamps
  let currentMilestoneFound = false
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (milestones[i].timestamp) {
      if (!currentMilestoneFound) {
        milestones[i].status = "completed"
      }
    } else if (!currentMilestoneFound && i > 0 && milestones[i - 1].timestamp) {
      milestones[i].status = "current"
      currentMilestoneFound = true
    }
  }

  // Use current time for lastUpdated
  const now = new Date().toISOString()

  return {
    status: detrackData.status || "processing",
    trackingStatus: detrackData.tracking_status || "Order received",
    milestones,
    lastUpdated: now,
  }
}

/**
 * Create a placeholder status for orders/parcels without Detrack IDs
 */
function createPlaceholderStatus(): DetrackStatusResponse {
  // Use Singapore time for timestamps
  const now = new Date()
  const sgTime = new Date(now.getTime()).toISOString()

  return {
    status: "detrack_missing",
    trackingStatus: "Tracking ID Missing",
    milestones: [
      {
        name: "Order Received",
        status: "completed",
        timestamp: sgTime,
        description: "Your order has been received and is being processed",
      },
      {
        name: "Tracking Setup",
        status: "current",
        timestamp: null,
        description: "Waiting for tracking ID to be assigned",
      },
      {
        name: "Out for Delivery",
        status: "upcoming",
        timestamp: null,
        description: "Your order will be out for delivery soon",
      },
      {
        name: "Delivered",
        status: "upcoming",
        timestamp: null,
        description: "Your order will be delivered soon",
      },
    ],
    lastUpdated: sgTime,
  }
}
