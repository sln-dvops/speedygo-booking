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

export async function getDetrackStatus(idParam: string): Promise<DetrackStatusResponse | null> {
  console.log(`getDetrackStatus called for ID: ${idParam}`)
  try {
    // Initialize Supabase client
    const supabase = await createClient()
    console.log(`Supabase client initialized for ID: ${idParam}`)

    // First, determine if this is an order ID or a parcel ID
    // Try to find it in the parcels table first
    const { data: parcelData, error: parcelError } = await supabase
      .from("parcels")
      .select("id, order_id, detrack_job_id, status")
      .eq("id", idParam)
      .maybeSingle()

    // If found in parcels table, use the parcel's detrack_job_id
    if (parcelData) {
      console.log(`ID ${idParam} found in parcels table:`, parcelData)

      // If the parcel doesn't have a detrack_job_id yet, return a placeholder status
      if (!parcelData.detrack_job_id) {
        console.log(`Parcel ${idParam} does not have a Detrack job ID yet`)
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

      // Use the parcel's detrack_job_id to fetch status from Detrack API
      const detrackId = parcelData.id

      // Check if Detrack API URL is configured
      if (!detrackConfig.apiUrl) {
        console.error("Detrack API URL is not configured")
        return null
      }

      // Fetch the delivery status from Detrack using the detrack_job_id
      const baseUrl = detrackConfig.apiUrl
      const apiUrl = `${baseUrl}/${detrackId}`
      console.log(`Fetching Detrack status from: ${apiUrl}`)

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
      console.log(`Detrack API response for parcel ${idParam}:`, JSON.stringify(detrackResponse, null, 2))

      const detrackData = detrackResponse.data

      if (!detrackData) {
        console.error("No data returned from Detrack API")
        return null
      }

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

    // If not found in parcels, check if it's a short_id and convert to full UUID if needed
    let fullOrderId = idParam

    if (isShortId(idParam)) {
      console.log(`${idParam} appears to be a short_id, looking up full UUID`)
      const { data: orderData, error: lookupError } = await supabase
        .from("orders")
        .select("id")
        .eq("short_id", idParam)
        .single()

      if (lookupError || !orderData) {
        console.error(`Error looking up full UUID for short_id ${idParam}:`, lookupError)
        return null
      }

      fullOrderId = orderData.id
      console.log(`Converted short_id ${idParam} to full UUID ${fullOrderId}`)
    }

    // Fetch the order to get the Detrack ID using the full UUID
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("detrack_id, status, is_bulk_order")
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
      // For bulk orders, we need to fetch the first parcel's Detrack job ID
      const { data: parcelData, error: parcelError } = await supabase
        .from("parcels")
        .select("id, detrack_job_id")
        .eq("order_id", fullOrderId)
        .order("created_at", { ascending: true })
        .limit(1)
        .single()

      if (parcelError || !parcelData || !parcelData.detrack_job_id) {
        console.log(`No parcels with Detrack job IDs found for bulk order ${fullOrderId}`)
        // Use Singapore time for timestamps
        const now = new Date()
        // Format in ISO string but ensure it's in Singapore time (UTC+8)
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

      // Use the parcel's detrack_job_id to fetch status from Detrack API
      const detrackId = parcelData.detrack_job_id

      // Check if Detrack API URL is configured
      if (!detrackConfig.apiUrl) {
        console.error("Detrack API URL is not configured")
        return null
      }

      // Fetch the delivery status from Detrack using the detrack_job_id
      const baseUrl = detrackConfig.apiUrl
      const apiUrl = `${baseUrl}/${detrackId}`
      console.log(`Fetching Detrack status from: ${apiUrl}`)

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
      console.log(`Detrack API response for order ${fullOrderId}:`, JSON.stringify(detrackResponse, null, 2))

      const detrackData = detrackResponse.data

      if (!detrackData) {
        console.error("No data returned from Detrack API")
        return null
      }

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
    } else if (!orderData.detrack_id) {
      console.log(`Order ${fullOrderId} does not have a Detrack ID yet, returning custom error status`)
      // Use Singapore time for timestamps
      const now = new Date()
      // Format in ISO string but ensure it's in Singapore time (UTC+8)
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

    // Check if Detrack API URL is configured
    if (!detrackConfig.apiUrl) {
      console.error("Detrack API URL is not configured")
      return null
    }

    // Fetch the delivery status from Detrack using the DO number
    const baseUrl = detrackConfig.apiUrl
    const apiUrl = `${baseUrl}/${fullOrderId}` // Use the full UUID as the DO number
    console.log(`Fetching Detrack status from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: createDetrackHeaders(),
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    console.log(`Detrack API response status for ${fullOrderId}: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      console.error(`Detrack API error: ${response.status} ${response.statusText}`)
      return null
    }

    const detrackResponse = await response.json()
    console.log(`Detrack API response for order ${fullOrderId}:`, JSON.stringify(detrackResponse, null, 2))

    const detrackData = detrackResponse.data

    if (!detrackData) {
      console.error("No data returned from Detrack API")
      return null
    }

    console.log(`Detrack data for order ${fullOrderId}:`, JSON.stringify(detrackData, null, 2))

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

    // Use current time for lastUpdated instead of relying on Detrack's updated_at
    // This ensures the time is consistent with our system
    const now = new Date().toISOString()

    return {
      status: detrackData.status || "processing",
      trackingStatus: detrackData.tracking_status || "Order received",
      milestones,
      lastUpdated: now,
    }
  } catch (error) {
    console.error("Error fetching Detrack status:", error)
    return null
  }
}

