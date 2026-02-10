"use server"

import { createClient } from "@/utils/supabase/server"
import type { ParcelDimensions } from "@/types/pricing"
import { isShortId } from "@/utils/orderIdUtils"

export async function getParcelDetails(parcelIdOrShortId: string): Promise<{
  parcel: ParcelDimensions & {
    id: string
    short_id?: string
    status?: string
    recipient_name: string
    recipient_address: string
    recipient_contact_number: string
    recipient_email: string
    pricing_tier: string
    detrack_job_id?: string
    created_at: string
  }
  order: {
    id: string
    short_id?: string
    sender_name: string
    status: string
    delivery_method: string
    created_at: string
  }
} | null> {
  try {
    const supabase = await createClient()
    let query = supabase.from("parcels").select(`
      *,
      orders:order_id (
        id,
        short_id,
        sender_name,
        status,
        delivery_method,
        created_at
      )
    `)

    // Check if parcelIdOrShortId is a short_id or full UUID
    if (isShortId(parcelIdOrShortId)) {
      // Search by short_id
      query = query.eq("short_id", parcelIdOrShortId)
    } else {
      // Search by full UUID
      query = query.eq("id", parcelIdOrShortId)
    }

    // Get the parcel details
    const { data, error } = await query.single()

    if (error) {
      console.error(`Error fetching parcel ${parcelIdOrShortId}:`, error)
      return null
    }

    if (!data) {
      console.error(`Parcel ${parcelIdOrShortId} not found`)
      return null
    }

    // Calculate volumetric weight
    const volumetricWeight = (data.length * data.width * data.height) / 5000
    const effectiveWeight = Math.max(data.weight, volumetricWeight)

    // Format the parcel data
    const parcel: ParcelDimensions & {
      id: string
      short_id?: string
      status?: string
      recipient_name: string
      recipient_address: string
      recipient_contact_number: string
      recipient_email: string
      pricing_tier: string
      detrack_job_id?: string
      created_at: string
    } = {
      id: data.id,
      short_id: data.short_id,
      weight: data.weight,
      length: data.length,
      width: data.width,
      height: data.height,
      effectiveWeight: effectiveWeight,
      status: data.status,
      recipient_name: data.recipient_name,
      recipient_address: data.recipient_address,
      recipient_contact_number: data.recipient_contact_number,
      recipient_email: data.recipient_email,
      pricing_tier: data.pricing_tier,
      detrack_job_id: data.detrack_job_id,
      created_at: data.created_at,
    }

    // Extract order data
    const order = data.orders

    return {
      parcel,
      order,
    }
  } catch (error) {
    console.error("Error getting parcel details:", error)
    return null
  }
}
