"use server"

import { createClient } from "@/utils/supabase/server"
import { detrackConfig, createDetrackHeaders } from "@/config/detrack"

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

export async function getDetrackStatus(orderId: string): Promise<DetrackStatusResponse | null> {
  console.log(`getDetrackStatus called for order ID: ${orderId}`)
  try {
    // Initialize Supabase client
    const supabase = await createClient()
    console.log(`Supabase client initialized for order ID: ${orderId}`)

    // 1. Fetch the order to get the Detrack ID
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("detrack_id, status")
      .eq("id", orderId)
      .single()

    console.log(`Order data fetched for ${orderId}:`, orderData)
    if (orderError) {
      console.error(`Error fetching order ${orderId}:`, orderError)
    }

    if (orderError || !orderData) {
      console.error("Error fetching order:", orderError)
      return null
    }

    // If order is not paid yet, return null
    if (orderData.status !== "paid") {
      console.log(`Order ${orderId} is not paid yet (status: ${orderData.status}), returning null`)
      return null
    }

    // If order is not yet in Detrack (we're still storing detrack_id as a flag),
    // return custom status indicating the issue
    if (!orderData.detrack_id) {
      console.log(`Order ${orderId} does not have a Detrack ID yet, returning custom error status`)
      // Use Singapore time for timestamps
      const now = new Date()
      // Format in ISO string but ensure it's in Singapore time (UTC+8)
      const sgTime = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString()

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

    // 2. Fetch the delivery status from Detrack using the DO number (which is our order ID)
    // According to Detrack API docs, we should use the DO number, not the Detrack ID
    const baseUrl = detrackConfig.apiUrl
    const apiUrl = `${baseUrl}/${orderId}` // Use the order ID as the DO number
    console.log(`Fetching Detrack status from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: createDetrackHeaders(),
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    console.log(`Detrack API response status for ${orderId}: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      console.error(`Detrack API error: ${response.status} ${response.statusText}`)
      return null
    }

    const detrackResponse = await response.json()
    console.log(`Detrack API response for order ${orderId}:`, JSON.stringify(detrackResponse, null, 2))

    const detrackData = detrackResponse.data

    if (!detrackData) {
      console.error("No data returned from Detrack API")
      return null
    }

    console.log(`Detrack data for order ${orderId}:`, JSON.stringify(detrackData, null, 2))

    // 3. Map Detrack status to our format
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

    return {
      status: detrackData.status || "processing",
      trackingStatus: detrackData.tracking_status || "Order received",
      milestones,
      lastUpdated: detrackData.updated_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error fetching Detrack status:", error)
    return null
  }
}

