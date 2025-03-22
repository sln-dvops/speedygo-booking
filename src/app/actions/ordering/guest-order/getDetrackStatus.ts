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
  try {
    // Initialize Supabase client
    const supabase = await createClient()

    // 1. Fetch the order to get the Detrack ID
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("detrack_id, status")
      .eq("id", orderId)
      .single()

    if (orderError || !orderData) {
      console.error("Error fetching order:", orderError)
      return null
    }

    // If order is not paid yet, return null
    if (orderData.status !== "paid") {
      return null
    }

    // If no Detrack ID, return basic status
    if (!orderData.detrack_id) {
      return {
        status: "processing",
        trackingStatus: "Order received",
        milestones: [
          {
            name: "Order Received",
            status: "completed",
            timestamp: new Date().toISOString(),
            description: "Your order has been received and is being processed",
          },
          {
            name: "Preparing for Shipment",
            status: "current",
            timestamp: null,
            description: "Your order is being prepared for shipment",
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
        lastUpdated: new Date().toISOString(),
      }
    }

    // Check if Detrack API URL is configured
    if (!detrackConfig.apiUrl) {
      console.error("Detrack API URL is not configured")
      return null
    }

    // 2. Fetch the delivery status from Detrack - use the correct URL format
    // The full URL should be provided in the environment variable, so we just append the ID
    const apiUrl = `${detrackConfig.apiUrl}/${orderData.detrack_id}`
    console.log(`Fetching Detrack status from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: createDetrackHeaders(),
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    if (!response.ok) {
      console.error(`Detrack API error: ${response.status} ${response.statusText}`)
      return null
    }

    const detrackResponse = await response.json()
    const detrackData = detrackResponse.data

    if (!detrackData) {
      console.error("No data returned from Detrack API")
      return null
    }

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

