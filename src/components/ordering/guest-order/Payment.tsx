"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { initiatePayment } from "@/app/actions/ordering/guest-order/payment"
import { PRICING, type ParcelSize, type CollectionMethod } from "@/types/pricing"

type PaymentProps = {
  onPrevStep: () => void
  selectedParcelSize: ParcelSize | null
  selectedCollectionMethod: CollectionMethod | null
  orderDetails: {
    senderName: string
    senderAddress: string
    recipientName: string
    recipientAddress: string
  }
}

export function Payment({ onPrevStep, selectedParcelSize, selectedCollectionMethod, orderDetails }: PaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const amount =
        selectedParcelSize && selectedCollectionMethod
          ? PRICING[selectedParcelSize][selectedCollectionMethod].discounted
          : 0

      const paymentUrl = await initiatePayment({
        amount,
        ...orderDetails,
        parcelSize: selectedParcelSize,
        collectionMethod: selectedCollectionMethod,
      })

      router.push(paymentUrl)
    } catch (error) {
      console.error("Payment initiation failed:", error)
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

