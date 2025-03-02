"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { initiatePayment } from "@/app/actions/ordering/guest-order/payment"
import { calculateShippingPrice } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails } from "@/types/order"
import type { ParcelDimensions, DeliveryMethod } from "@/types/pricing"

type PaymentProps = {
  onPrevStep: () => void
  orderDetails: PartialOrderDetails
  setOrderDetails: React.Dispatch<React.SetStateAction<PartialOrderDetails>>
  selectedDimensions: ParcelDimensions | null
  selectedDeliveryMethod: DeliveryMethod | null
  clearUnsavedChanges: () => void
}

export function Payment({
  onPrevStep,
  orderDetails,
  setOrderDetails,
  selectedDimensions,
  selectedDeliveryMethod,
  clearUnsavedChanges,
}: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    if (!selectedDimensions || !selectedDeliveryMethod) {
      setError("Please select parcel dimensions and delivery method.")
      setIsLoading(false)
      return
    }

    if (!orderDetails.senderEmail || !orderDetails.senderName) {
      setError("Sender information is incomplete. Please go back and fill in all required fields.")
      setIsLoading(false)
      return
    }

    try {
      const amount = calculateShippingPrice(selectedDimensions, selectedDeliveryMethod)

      const updatedOrderDetails: OrderDetails = {
        ...orderDetails,
        parcelSize: `${selectedDimensions.weight}kg`,
        deliveryMethod: selectedDeliveryMethod,
        orderNumber: `ORDER-${Date.now()}`, // Generate a temporary order number
      } as OrderDetails

      setOrderDetails(updatedOrderDetails)

      const paymentUrl = await initiatePayment({
        amount,
        orderDetails: updatedOrderDetails,
      })

      clearUnsavedChanges() // Clear unsaved changes before redirecting
      router.push(paymentUrl)
    } catch (error) {
      console.error("Payment initiation failed:", error)
      setError("Failed to initiate payment. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Payment</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <h3 className="font-medium text-lg text-black">Order Summary</h3>

          <div className="border-t border-b border-black py-4">
            <div className="flex justify-between mb-2 text-black">
              <span>Parcel Size</span>
              <span>{selectedDimensions ? `${selectedDimensions.weight}kg` : "Not selected"}</span>
            </div>
            <div className="flex justify-between mb-2 text-black">
              <span>Delivery Method</span>
              <span>{selectedDeliveryMethod || "Not selected"}</span>
            </div>
            <div className="flex justify-between font-medium text-black">
              <span>Total</span>
              <span className="text-black">
                {selectedDimensions && selectedDeliveryMethod
                  ? `S$${calculateShippingPrice(selectedDimensions, selectedDeliveryMethod).toFixed(2)}`
                  : "S$0.00"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4 text-black">Payment Method</h3>
            <p className="text-black">You will be redirected to HitPay to complete your payment securely.</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onPrevStep} className="border-black text-black hover:bg-yellow-100">
          Back
        </Button>
        <Button onClick={handlePayment} className="bg-black hover:bg-black/90 text-yellow-400" disabled={isLoading}>
          {isLoading ? "Processing..." : "Proceed to Payment"}
        </Button>
      </CardFooter>
    </Card>
  )
}

