"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { initiatePayment } from "@/app/actions/ordering/guest-order/payment"
import { PRICING } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails, ParcelSize, CollectionMethod } from "@/types/order"

type PaymentProps = {
  onPrevStep: () => void
  orderDetails: PartialOrderDetails
  setOrderDetails: React.Dispatch<React.SetStateAction<PartialOrderDetails>>
  selectedParcelSize: ParcelSize | null
  selectedCollectionMethod: CollectionMethod | null
}

export function Payment({
  onPrevStep,
  orderDetails,
  setOrderDetails,
  selectedParcelSize,
  selectedCollectionMethod,
}: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    if (!selectedParcelSize || !selectedCollectionMethod) {
      setError("Please select a parcel size and collection method.")
      setIsLoading(false)
      return
    }

    if (!orderDetails.senderEmail || !orderDetails.senderName) {
      setError("Sender information is incomplete. Please go back and fill in all required fields.")
      setIsLoading(false)
      return
    }

    try {
      const amount = PRICING[selectedParcelSize][selectedCollectionMethod].discounted

      const updatedOrderDetails: OrderDetails = {
        ...orderDetails,
        parcelSize: selectedParcelSize,
        collectionMethod: selectedCollectionMethod,
        orderNumber: `ORDER-${Date.now()}`, // Generate a temporary order number
      } as OrderDetails

      setOrderDetails(updatedOrderDetails)

      const paymentUrl = await initiatePayment({
        amount,
        orderDetails: updatedOrderDetails,
      })

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
              <span>Up to {selectedParcelSize}</span>
            </div>
            <div className="flex justify-between mb-2 text-black">
              <span>Collection Method</span>
              <span>{selectedCollectionMethod === "dropoff" ? "Drop off" : "Pick up"}</span>
            </div>
            <div className="flex justify-between font-medium text-black">
              <span>Total</span>
              <span className="text-black">
                {selectedParcelSize && selectedCollectionMethod
                  ? `S$${PRICING[selectedParcelSize][selectedCollectionMethod].discounted.toFixed(2)}`
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

