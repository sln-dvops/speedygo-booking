"use client"

import { useState, useEffect, useCallback } from "react"
import { checkOrderStatus } from "@/app/actions/ordering/guest-order/checkOrderStatus"
import type { OrderWithParcels } from "@/types/order"
import { Waybill } from "@/components/ordering/guest-order/Waybill"

interface OrderStatusRefresherProps {
  orderId: string
  initialStatus: string
  orderDetails: OrderWithParcels
}

export function OrderStatusRefresher({ orderId, initialStatus, orderDetails }: OrderStatusRefresherProps) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  // Function to check order status - wrapped in useCallback to avoid dependency issues
  const refreshOrderStatus = useCallback(async () => {
    if (status === "paid") return // No need to check if already paid

    try {
      setLoading(true)
      const newStatus = await checkOrderStatus(orderId)

      if (newStatus) {
        setStatus(newStatus)
      }
    } catch (error) {
      console.error("Error checking order status:", error)
    } finally {
      setLoading(false)
    }
  }, [orderId, status])

  // Check status on initial load
  useEffect(() => {
    if (initialStatus !== "paid") {
      refreshOrderStatus()
    }
  }, [initialStatus, refreshOrderStatus])

  // Set up polling to check status every 3 seconds if not paid
  useEffect(() => {
    if (status !== "paid") {
      const interval = setInterval(refreshOrderStatus, 3000) // Check every 3 seconds
      return () => clearInterval(interval)
    }
  }, [status, refreshOrderStatus])

  return (
    <div>
      {loading && status !== "paid" && <div className="mb-4 text-sm text-gray-600">Checking payment status...</div>}

      <div>
        <h2 className="text-2xl font-bold text-black mb-4">Thank you for your order!</h2>

        <div className="mb-6">
          <p className="text-black mb-2">Your order has been {status === "paid" ? "confirmed" : "received"}.</p>
          <p className="text-black mb-2">
            Order Number: <span className="font-semibold">{orderDetails.orderNumber}</span>
          </p>
          {status === "paid" ? (
            <p className="text-green-600 font-semibold">Payment Status: Paid</p>
          ) : (
            <p className="text-amber-600 font-semibold">Payment Status: {status || "Pending"}</p>
          )}
        </div>

        {status === "paid" && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-black mb-4">Your Shipping Label</h3>
            <p className="text-black mb-4">Please print this shipping label and attach it to your parcel.</p>

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

