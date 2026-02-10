"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createOrder } from "@/app/actions/ordering/guest-order/payment"
import { calculateShippingPrice } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails } from "@/types/order"
import type { ParcelDimensions, DeliveryMethod } from "@/types/pricing"

type PaymentProps = {
  onPrevStep: () => void
  orderDetails: OrderDetails
  setOrderDetails: React.Dispatch<React.SetStateAction<PartialOrderDetails>>
  selectedDimensions: ParcelDimensions[] | null
  selectedDeliveryMethod: DeliveryMethod | undefined
  clearUnsavedChanges: () => void
}

export function Payment({
  onPrevStep,
  orderDetails,
  selectedDimensions,
  selectedDeliveryMethod,
  clearUnsavedChanges,
}: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!selectedDimensions || selectedDimensions.length === 0 || !selectedDeliveryMethod) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">Missing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            Please go back and select parcel dimensions and delivery method before proceeding to payment.
          </p>
        </CardContent>
        <CardFooter className="px-6 py-4 flex justify-between">
          <Button variant="outline" onClick={onPrevStep} className="border-black text-black hover:bg-yellow-100">
            Back
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Calculate total price for all parcels
  const totalPrice = selectedDimensions.reduce((sum, dimensions) => {
    return sum + calculateShippingPrice(dimensions, selectedDeliveryMethod)
  }, 0)

  // Format price for display
  const formattedPrice = totalPrice.toFixed(2)

  // Update the handlePayment function to ensure recipients are passed to createOrder
  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Update order details with final price and delivery method
      const updatedOrderDetails = {
        ...orderDetails,
        amount: totalPrice,
        deliveryMethod: selectedDeliveryMethod,
      }

      // Extract recipient details for bulk orders
      const recipients = orderDetails.recipients || []

      console.log("Sending recipients to createOrder:", recipients)

      // Create the order in the database and get payment URL
      const result = await createOrder(updatedOrderDetails, selectedDimensions || [], recipients)

      if (result.success && result.paymentUrl) {
        // Clear unsaved changes before redirecting
        clearUnsavedChanges()

        // Redirect to payment page
        window.location.href = result.paymentUrl
      } else {
        setError(result.error || "Failed to create order. Please try again.")
      }
    } catch (err) {
      console.error("Payment error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Payment</CardTitle>
        {orderDetails.isBulkOrder && (
          <Badge variant="outline" className="bg-yellow-200 text-black border-black mt-2">
            Bulk Order ({selectedDimensions.length} Parcels)
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold text-black mb-4">Order Summary</h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Sender:</span>
              <span className="font-medium text-black">{orderDetails.senderName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Recipient:</span>
              <span className="font-medium text-black">
                {orderDetails.isBulkOrder
                  ? `Multiple (${selectedDimensions.length})`
                  : orderDetails.recipientName || "Not specified"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Method:</span>
              <span className="font-medium text-black capitalize">{selectedDeliveryMethod.replace("-", " ")}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Parcels:</span>
              <span className="font-medium text-black">{selectedDimensions.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Total Weight:</span>
              <span className="font-medium text-black">
                {selectedDimensions.reduce((sum, parcel) => sum + parcel.weight, 0).toFixed(2)} kg
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-lg text-gray-800">Total Price:</span>
              <span className="text-2xl font-bold text-black">${formattedPrice}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg">
          <h4 className="font-medium text-black mb-2">Payment Information</h4>
          <p className="text-sm text-gray-600">
            You will be redirected to our secure payment provider to complete your payment. We accept PayNow, credit
            cards, and other payment methods.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
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

