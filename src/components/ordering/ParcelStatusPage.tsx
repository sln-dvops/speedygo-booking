"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, User, MapPin, Phone, Mail } from "lucide-react"
import { DetrackStatusTracker } from "@/components/ordering/shared/DetrackStatusTracker"

interface ParcelStatusPageProps {
  parcelData: {
    parcel: {
      id: string
      short_id?: string
      weight: number
      length: number
      width: number
      height: number
      effectiveWeight: number
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
  }
}

export function ParcelStatusPage({ parcelData }: ParcelStatusPageProps) {
  const { parcel, order } = parcelData

  // Format date in Singapore time (UTC+8)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-SG", {
      timeZone: "Asia/Singapore",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "out for delivery":
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress":
      case "in progress":
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
      case "paid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
      case "delivery_failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Parcel Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-black">Parcel Information</CardTitle>
            <Badge className={getStatusColor(parcel.status || order.status)}>{parcel.status || order.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Package className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-black">Parcel ID</p>
                <p className="text-gray-600">{parcel.short_id || parcel.id.slice(-12)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-black">Order Date</p>
                <p className="text-gray-600">{formatDate(parcel.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-black mb-2">Parcel Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium text-black">{parcel.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dimensions</p>
                <p className="font-medium text-black">
                  {parcel.length}×{parcel.width}×{parcel.height} cm
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pricing Tier</p>
                <p className="font-medium text-black">{parcel.pricing_tier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Method</p>
                <p className="font-medium text-black capitalize">{order.delivery_method.replace("-", " ")}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-black mb-2">Recipient Information</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-black">{parcel.recipient_name}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-black">{parcel.recipient_address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium text-black">{parcel.recipient_contact_number}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-black">{parcel.recipient_email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-black mb-2">Sender Information</h3>
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-black">{order.sender_name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Information - Using DetrackStatusTracker */}
      <DetrackStatusTracker
        orderId={parcel.id} // IMPORTANT: Always use our internal UUID (parcel.id), never use detrack_job_id
        isBulkOrder={false}
        totalParcels={1}
        parcels={[
          {
            weight: parcel.weight,
            length: parcel.length,
            width: parcel.width,
            height: parcel.height,
          },
        ]}
      />
    </div>
  )
}
