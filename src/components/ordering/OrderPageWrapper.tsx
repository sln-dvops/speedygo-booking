"use client"

import { useEffect, useState } from "react"
import { OrderDetails } from "@/components/ordering/guest-order/OrderDetails"
import { CancelledOrder } from "@/components/ordering/shared/CancelledOrder"
import { DetrackStatusTracker } from "@/components/ordering/shared/DetrackStatusTracker"
import type { OrderWithParcels } from "@/types/order"

interface OrderPageWrapperProps {
  orderId: string
  initialOrderDetails: OrderWithParcels
}

export function OrderPageWrapper({ orderId, initialOrderDetails }: OrderPageWrapperProps) {
  const [isCancelled, setIsCancelled] = useState(false)
  const [orderDetails, setOrderDetails] = useState<OrderWithParcels>(initialOrderDetails)

  // Debug logging
  useEffect(() => {
    console.log("OrderPageWrapper - Current order status:", orderDetails.status)
    console.log("OrderPageWrapper - Initial order status:", initialOrderDetails.status)
  }, [orderDetails.status, initialOrderDetails.status])

  useEffect(() => {
    // Check if the URL contains "status=canceled"
    const fullUrl = window.location.href
    const urlContainsCancelled = fullUrl.includes("status=canceled")

    console.log("Full URL (client):", fullUrl)
    console.log("Is cancelled (client):", urlContainsCancelled)

    setIsCancelled(urlContainsCancelled)
  }, [])

  // Update orderDetails when initialOrderDetails changes
  useEffect(() => {
    setOrderDetails(initialOrderDetails)
  }, [initialOrderDetails])

  if (isCancelled) {
    return <CancelledOrder orderId={orderId} />
  }

  // Determine if this is a bulk order and how many parcels it has
  const isBulkOrder = orderDetails.isBulkOrder
  const totalParcels = orderDetails.parcels?.length || 1

  return (
    <>
      <OrderDetails orderId={orderId} initialOrderDetails={orderDetails} />

      {/* Always show the DetrackStatusTracker for paid orders, even if initialOrderDetails hasn't updated yet */}
      {(orderDetails.status === "paid" ||
        initialOrderDetails.status === "paid" ||
        orderDetails.status === "processing" ||
        initialOrderDetails.status === "processing") && (
        <div className="mt-8">
          <DetrackStatusTracker
            orderId={orderId}
            isBulkOrder={isBulkOrder}
            totalParcels={totalParcels}
            parcels={orderDetails.parcels}
          />
        </div>
      )}
    </>
  )
}
