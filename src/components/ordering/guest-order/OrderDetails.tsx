"use client"

import { useState, useEffect } from "react"
import { Waybill } from "@/components/ordering/guest-order/Waybill"
import { checkOrderStatus } from "@/app/actions/ordering/guest-order/checkOrderStatus"
import type { OrderWithParcels } from "@/types/order"

interface OrderDetailsProps {
  orderId: string
  initialOrderDetails: OrderWithParcels
}

export function OrderDetails({ orderId, initialOrderDetails }: OrderDetailsProps) {
  const [orderDetails, setOrderDetails] = useState<OrderWithParcels>(initialOrderDetails)
  const [status, setStatus] = useState(initialOrderDetails.status || "pending")
  const [loading, setLoading] = useState(false)

  // Function to check order status
  const refreshOrderStatus = async () => {
    if (status === "paid") return // No need to check if already paid

    try {
      setLoading(true)
      const newStatus = await checkOrderStatus(orderId)

      if (newStatus) {
        setStatus(newStatus)
        setOrderDetails((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (error) {
      console.error("Error checking order status:", error)
    } finally {
      setLoading(false)
    }
  }

  // Check status on initial load and set up polling
  useEffect(() => {
    // Immediately stop polling if status is paid
    if (status === "paid") {
      return
    }

    refreshOrderStatus()

    const interval = setInterval(refreshOrderStatus, 3000) // Check every 3 seconds
    return () => clearInterval(interval)
  }, [status, orderId])

  return (
    <div>
      {loading && status !== "paid" && <div className="mb-4 text-sm text-gray-600">Checking payment status...</div>}

      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Thank you for your order!</h2>

        <div className="mb-6">
          <p className="text-black mb-2">Your order has been {status === "paid" ? "confirmed" : "received"}.</p>
          <p className="text-black mb-2">
            Order Number:{" "}
            <span className="font-semibold">{orderDetails.shortId || orderDetails.orderNumber.slice(-12)}</span>
          </p>
          {status === "paid" ? (
            <p className="text-green-600 font-semibold">Payment Status: Paid</p>
          ) : (
            <p className="text-amber-600 font-semibold">Payment Status: {status || "Pending"}</p>
          )}
        </div>

        {status === "paid" && (
          <div className="mt-8">
            <Waybill orderDetails={{ ...orderDetails, status }} />
          </div>
        )}

        {status !== "paid" && (
          <div className="bg-amber-100 p-4 rounded-lg">
            <p className="text-black">
              We&apos;re still processing your payment. This page will automatically update once payment is confirmed.
              <span className="block mt-2 text-sm">
                (Note: This may take a few moments as we wait for payment confirmation from our payment provider)
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

