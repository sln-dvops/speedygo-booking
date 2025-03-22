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

  return (
    <>
      <OrderDetails orderId={orderId} initialOrderDetails={orderDetails} />

      {/* Add the DetrackStatusTracker component - show for both paid and processing statuses */}
      {(orderDetails.status === "paid" || orderDetails.status === "processing") && (
        <div className="mt-8">
          <DetrackStatusTracker orderId={orderId} />
        </div>
      )}
    </>
  )
}

