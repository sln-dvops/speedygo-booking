"use client"

import { useEffect, useState } from "react"
import { OrderDetails } from "@/components/ordering/guest-order/OrderDetails"
import { CancelledOrder } from "@/components/ordering/shared/CancelledOrder"
import type { OrderWithParcels } from "@/types/order"

interface OrderPageWrapperProps {
  orderId: string
  initialOrderDetails: OrderWithParcels
}

export function OrderPageWrapper({ orderId, initialOrderDetails }: OrderPageWrapperProps) {
  const [isCancelled, setIsCancelled] = useState(false)

  useEffect(() => {
    // Check if the URL contains "status=canceled"
    const fullUrl = window.location.href
    const urlContainsCancelled = fullUrl.includes("status=canceled")

    console.log("Full URL (client):", fullUrl)
    console.log("Is cancelled (client):", urlContainsCancelled)

    setIsCancelled(urlContainsCancelled)
  }, [])

  if (isCancelled) {
    return <CancelledOrder orderId={orderId} />
  }

  return <OrderDetails orderId={orderId} initialOrderDetails={initialOrderDetails} />
}

