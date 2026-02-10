"use client"

import { useEffect, useState, useCallback } from "react"
import { getDetrackStatus, type DetrackStatusResponse } from "@/app/actions/ordering/guest-order/getDetrackStatus"
import { CheckCircle, Clock, Package, Truck, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getParcelIdsForOrder } from "@/app/actions/ordering/guest-order/getParcelIds" // We'll create this server action

// First, let's update the props interface to include parcel dimensions
export interface DetrackStatusTrackerProps {
  orderId: string
  isBulkOrder?: boolean
  totalParcels?: number
  parcels?: Array<{
    weight: number
    length: number
    width: number
    height: number
  }>
}

// Then update the function signature to use the new props
export function DetrackStatusTracker({
  orderId,
  isBulkOrder = false,
  totalParcels = 1,
  parcels = [],
}: DetrackStatusTrackerProps) {
  const [status, setStatus] = useState<DetrackStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [currentParcelIndex, setCurrentParcelIndex] = useState(0)
  const [parcelStatuses, setParcelStatuses] = useState<(DetrackStatusResponse | null)[]>(() =>
    isBulkOrder && totalParcels > 1 ? Array(totalParcels).fill(null) : [],
  )
  const [parcelIds, setParcelIds] = useState<string[]>([])
  const [loadingParcelIds, setLoadingParcelIds] = useState(false)

  // Remove the unused orderDetails state
  // const [orderDetails, setOrderDetails] = useState<any>(null)

  // Fetch parcel IDs for bulk orders
  useEffect(() => {
    async function fetchParcelIds() {
      if (isBulkOrder && totalParcels > 1) {
        try {
          setLoadingParcelIds(true)
          const ids = await getParcelIdsForOrder(orderId)
          if (ids && ids.length > 0) {
            setParcelIds(ids)
          }
        } catch (err) {
          console.error("Error fetching parcel IDs:", err)
          setError("Failed to load parcel information. Please try again later.")
        } finally {
          setLoadingParcelIds(false)
        }
      }
    }

    fetchParcelIds()
  }, [orderId, isBulkOrder, totalParcels])

  // Function to fetch status for a specific parcel or the main order
  const fetchStatus = useCallback(
    async (parcelIndex?: number) => {
      try {
        setLoading(true)
        setError(null)

        // If it's a bulk order and we have a specific parcel index
        if (isBulkOrder && parcelIndex !== undefined && parcelIds.length > 0) {
          // Get the parcel ID at the specified index
          const parcelId = parcelIds[parcelIndex]
          if (!parcelId) {
            throw new Error(`Parcel at index ${parcelIndex} not found`)
          }

          // Fetch the status using the parcel ID
          const data = await getDetrackStatus(parcelId)

          // Update the status for this specific parcel
          setParcelStatuses((prev) => {
            const newStatuses = [...prev]
            newStatuses[parcelIndex] = data
            return newStatuses
          })

          // If this is the current parcel, also update the main status
          if (parcelIndex === currentParcelIndex) {
            setStatus(data)
          }
        } else {
          // For individual orders, first fetch the parcel ID
          if (!isBulkOrder) {
            try {
              // Fetch the parcel ID for this order
              const ids = await getParcelIdsForOrder(orderId)
              if (ids && ids.length > 0) {
                // Use the first parcel ID for individual orders
                const parcelId = ids[0]
                console.log(`Using parcel ID ${parcelId} for individual order ${orderId}`)

                // Fetch the status using the parcel ID
                const data = await getDetrackStatus(parcelId)
                setStatus(data)
                setParcelStatuses([data])
              } else {
                // Fallback to order ID if no parcel IDs found
                console.log(`No parcel IDs found for order ${orderId}, falling back to order ID`)
                const data = await getDetrackStatus(orderId)
                setStatus(data)
                setParcelStatuses([data])
              }
            } catch (err) {
              console.error("Error fetching parcel ID for individual order:", err)
              // Fallback to order ID if error occurs
              const data = await getDetrackStatus(orderId)
              setStatus(data)
              setParcelStatuses([data])
            }
          } else {
            // For bulk orders without a specific parcel index
            const data = await getDetrackStatus(orderId)
            setStatus(data)
          }
        }

        setLastRefreshed(new Date())
      } catch (err) {
        setError("Failed to load tracking information. Please try again later.")
        console.error("Error fetching tracking status:", err)
      } finally {
        setLoading(false)
      }
    },
    [orderId, isBulkOrder, currentParcelIndex, parcelIds],
  )

  // Initial fetch for all parcels in a bulk order
  useEffect(() => {
    if (isBulkOrder && totalParcels > 1) {
      // Only fetch status if we have parcel IDs
      if (parcelIds.length > 0) {
        // Fetch status for the current parcel
        fetchStatus(currentParcelIndex)
      }
    } else {
      // For individual orders, just fetch the main status
      fetchStatus()
    }
  }, [fetchStatus, isBulkOrder, totalParcels, currentParcelIndex, parcelIds])

  // Function to navigate to the previous parcel
  const handlePrevParcel = () => {
    if (currentParcelIndex > 0) {
      const newIndex = currentParcelIndex - 1
      setCurrentParcelIndex(newIndex)

      // If we already have the status for this parcel, use it
      if (parcelStatuses[newIndex]) {
        setStatus(parcelStatuses[newIndex])
      } else {
        // Otherwise fetch it
        fetchStatus(newIndex)
      }
    }
  }

  // Function to navigate to the next parcel
  const handleNextParcel = () => {
    if (currentParcelIndex < totalParcels - 1) {
      const newIndex = currentParcelIndex + 1
      setCurrentParcelIndex(newIndex)

      // If we already have the status for this parcel, use it
      if (parcelStatuses[newIndex]) {
        setStatus(parcelStatuses[newIndex])
      } else {
        // Otherwise fetch it
        fetchStatus(newIndex)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "out for delivery":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "in_progress":
      case "in progress":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "detrack_missing":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "out for delivery":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress":
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "detrack_missing":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Format date in Singapore time (UTC+8)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Pending"

    // Create date object and format in Singapore time
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-SG", {
      timeZone: "Asia/Singapore",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  // Format time in Singapore time (UTC+8)
  const formatLastRefreshed = (date: Date) => {
    return new Intl.DateTimeFormat("en-SG", {
      timeZone: "Asia/Singapore",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-black">Delivery Status</CardTitle>
              <p className="text-black mt-2">Tracking information for your order</p>
            </div>
            <Button onClick={() => fetchStatus(currentParcelIndex)} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Update the navigation section to use the parcels prop
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold text-black">Delivery Status</CardTitle>
            <p className="text-black mt-2">Tracking information for your order</p>
          </div>
          <Button onClick={() => fetchStatus(currentParcelIndex)} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Navigation for bulk orders */}
        {isBulkOrder && totalParcels > 1 && (
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevParcel}
              disabled={currentParcelIndex === 0 || loadingParcelIds}
              className="border-black text-black hover:bg-yellow-100"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <div className="flex flex-col items-center">
              <span className="font-medium">
                Parcel {currentParcelIndex + 1} of {totalParcels}
              </span>
              {isBulkOrder && parcels && parcels.length > 0 && currentParcelIndex < parcels.length && (
                <Badge variant="outline" className="mt-1 text-xs bg-yellow-100 border-yellow-300">
                  {parcels[currentParcelIndex].weight.toFixed(1)}kg •{parcels[currentParcelIndex].length}×
                  {parcels[currentParcelIndex].width}×{parcels[currentParcelIndex].height}cm
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextParcel}
              disabled={currentParcelIndex === totalParcels - 1 || loadingParcelIds}
              className="border-black text-black hover:bg-yellow-100"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {(loading || loadingParcelIds) && !status ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : status ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.status)}
                <div>
                  <Badge className={getStatusColor(status.status)}>{status.trackingStatus}</Badge>
                </div>
              </div>
              <div className="text-xs text-gray-500">Last updated: {formatDate(status.lastUpdated)}</div>
            </div>

            {status.status === "detrack_missing" && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-2">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Tracking ID Not Created</p>
                    <p className="text-xs text-orange-700 mt-1">
                      Your order has been received, but the tracking ID has not been created yet. This is usually
                      resolved automatically. If this persists for more than 30 minutes, please contact customer
                      support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
              {status.milestones.map((milestone, index) => {
                // Determine the correct milestone status based on the tracking status
                let milestoneStatus = milestone.status

                // If the order is completed/delivered, mark all milestones as completed
                if (status.status === "completed" || status.trackingStatus.toLowerCase() === "completed") {
                  milestoneStatus = "completed"
                }
                // If the tracking status is "Out for delivery"
                else if (status.trackingStatus.toLowerCase().includes("out for delivery")) {
                  if (index === 0 || index === 1) {
                    // Mark "Order Received" and "Preparing for Shipment" as completed
                    milestoneStatus = "completed"
                  } else if (index === 2) {
                    // Mark "Out for Delivery" as current
                    milestoneStatus = "current"
                  }
                }

                return (
                  <div key={index} className="relative pb-6">
                    <div
                      className="absolute left-0 top-1.5 -ml-2 h-4 w-4 rounded-full ring-2 ring-white"
                      style={{
                        backgroundColor:
                          milestoneStatus === "completed"
                            ? "#10b981"
                            : milestoneStatus === "current"
                              ? "#3b82f6"
                              : "#d1d5db",
                      }}
                    />
                    <div className="ml-6">
                      <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                      <p className="text-sm text-gray-500">{milestone.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {milestone.timestamp ? formatDate(milestone.timestamp) : "Pending"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-xs text-gray-500 text-right">Last refreshed: {formatLastRefreshed(lastRefreshed)}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <Package className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">No tracking information available yet</p>
            <p className="text-xs text-gray-400">Tracking details will appear here once your order is processed</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
