"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { checkOrderStatus } from "@/app/actions/ordering/guest-order/checkOrderStatus"
import type { OrderWithParcels } from "@/types/order"
import { Waybill } from "@/components/ordering/guest-order/Waybill"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface OrderStatusRefresherProps {
  orderId: string
  initialStatus: string
  orderDetails: OrderWithParcels
}

// Move constants outside the component to avoid dependency issues
const MAX_POLLING_TIME = 30 * 60 * 1000 // 30 minutes
const MAX_ATTEMPTS = 300 // 300 attempts at 3s = 15 minutes
const POLLING_INTERVAL = 3000 // 3 seconds

export function OrderStatusRefresher({ orderId, initialStatus, orderDetails }: OrderStatusRefresherProps) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [pollingActive, setPollingActive] = useState(true)
  const [attemptCount, setAttemptCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Remove the constants from inside the component
  const startTimeRef = useRef<number>(Date.now())

  // Function to check order status - wrapped in useCallback to avoid dependency issues
  const refreshOrderStatus = useCallback(async () => {
    if (status === "paid") return // No need to check if already paid

    try {
      setLoading(true)
      const newStatus = await checkOrderStatus(orderId)

      if (newStatus) {
        setStatus(newStatus)

        // If status is now paid, stop polling
        if (newStatus === "paid") {
          setPollingActive(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      }

      // Increment attempt counter
      setAttemptCount((prev) => prev + 1)

      // Check if we should stop polling
      const elapsedTime = Date.now() - startTimeRef.current
      if (elapsedTime > MAX_POLLING_TIME || attemptCount >= MAX_ATTEMPTS) {
        setPollingActive(false)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    } catch (error) {
      console.error("Error checking order status:", error)
    } finally {
      setLoading(false)
    }
  }, [orderId, status, attemptCount]) // We don't need MAX_POLLING_TIME in deps since it's now outside

  // Check status on initial load
  useEffect(() => {
    if (initialStatus !== "paid") {
      refreshOrderStatus()
    } else {
      // If initial status is already paid, make sure polling is disabled
      setPollingActive(false)
    }

    // Cleanup function for component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [initialStatus, refreshOrderStatus])

  // Set up polling to check status every 3 seconds if not paid
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only set up polling if status isn't paid and polling is active
    if (status !== "paid" && pollingActive) {
      intervalRef.current = setInterval(refreshOrderStatus, POLLING_INTERVAL)

      // Log for debugging
      console.log(`Setting up polling interval. Attempt count: ${attemptCount}`)
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [status, refreshOrderStatus, pollingActive, attemptCount])

  // Also check if document is visible to reduce unnecessary calls
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && intervalRef.current) {
        // Pause polling when tab is not visible
        clearInterval(intervalRef.current)
        intervalRef.current = null
        console.log("Tab hidden, pausing polling")
      } else if (document.visibilityState === "visible" && !intervalRef.current && status !== "paid" && pollingActive) {
        // Refresh immediately when tab becomes visible again
        console.log("Tab visible, resuming polling")
        refreshOrderStatus()
        intervalRef.current = setInterval(refreshOrderStatus, POLLING_INTERVAL)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [refreshOrderStatus, status, pollingActive])

  // Manual refresh handler
  const handleManualRefresh = () => {
    refreshOrderStatus()
  }

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

            {!pollingActive && (
              <div className="mt-4 border-t border-amber-200 pt-4">
                <p className="text-amber-700 mb-2">
                  Automatic status checking has stopped. If you&apos;ve completed payment, please refresh manually:
                </p>
                <Button
                  onClick={handleManualRefresh}
                  variant="outline"
                  className="bg-white border-amber-500 text-amber-700 hover:bg-amber-50"
                  disabled={loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Check Payment Status
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
