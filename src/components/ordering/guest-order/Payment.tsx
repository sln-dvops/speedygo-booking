"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { initiatePayment } from "@/app/actions/ordering/guest-order/payment"
import { calculateShippingPrice } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails } from "@/types/order"
import type { ParcelDimensions, DeliveryMethod } from "@/types/pricing"

type PaymentProps = {
  onPrevStep: () => void
  orderDetails: PartialOrderDetails
  setOrderDetails: React.Dispatch<React.SetStateAction<PartialOrderDetails>>
  selectedDimensions: ParcelDimensions[] | null
  selectedDeliveryMethod: DeliveryMethod | undefined
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

  const isBulkOrder = selectedDimensions && selectedDimensions.length > 1

  // Calculate total price for all parcels
  const calculateTotalPrice = () => {
    if (!selectedDimensions || !selectedDeliveryMethod) return 0

    // For a single parcel
    if (selectedDimensions.length === 1) {
      return calculateShippingPrice(selectedDimensions[0], selectedDeliveryMethod)
    }

    // For bulk orders - no discount, just multiply by number of parcels
    const pricePerParcel = calculateShippingPrice(selectedDimensions[0], selectedDeliveryMethod)
    return pricePerParcel * selectedDimensions.length
  }

  const totalPrice = calculateTotalPrice()
  const totalWeight = selectedDimensions?.reduce((sum, parcel) => sum + parcel.weight, 0) || 0

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
      const amount = calculateTotalPrice()

      const updatedOrderDetails: OrderDetails = {
        ...orderDetails,
        parcelSize: isBulkOrder
          ? `Bulk Order (${selectedDimensions.length} parcels, ${totalWeight.toFixed(2)}kg total)`
          : `${selectedDimensions[0].weight}kg`,
        deliveryMethod: selectedDeliveryMethod,
        orderNumber: `ORDER-${Date.now()}`, // Generate a temporary order number
        isBulkOrder: isBulkOrder,
        totalParcels: selectedDimensions.length,
        totalWeight: totalWeight,
      } as OrderDetails

      setOrderDetails(updatedOrderDetails)

      const paymentUrl = await initiatePayment({
        amount,
        orderDetails: updatedOrderDetails,
        parcels: selectedDimensions.map((dimensions) => ({
          weight: dimensions.weight,
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
        })),
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
        {isBulkOrder && (
          <Badge variant="outline" className="bg-yellow-200 text-black border-black mt-2">
            Bulk Order ({selectedDimensions?.length} Parcels)
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <h3 className="font-medium text-lg text-black">Order Summary</h3>

          <div className="border-t border-b border-black py-4">
            {isBulkOrder ? (
              <>
                <div className="flex justify-between mb-2 text-black">
                  <span>Number of Parcels</span>
                  <span>{selectedDimensions?.length || 0}</span>
                </div>
                <div className="flex justify-between mb-2 text-black">
                  <span>Total Weight</span>
                  <span>{totalWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between mb-2 text-black">
                  <span>Price Per Parcel</span>
                  <span>
                    S$
                    {selectedDimensions?.[0] && selectedDeliveryMethod
                      ? calculateShippingPrice(selectedDimensions[0], selectedDeliveryMethod).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between mb-2 text-black">
                <span>Parcel Size</span>
                <span>{selectedDimensions?.[0] ? `${selectedDimensions[0].weight}kg` : "Not selected"}</span>
              </div>
            )}

            <div className="flex justify-between mb-2 text-black">
              <span>Delivery Method</span>
              <span>{selectedDeliveryMethod || "Not selected"}</span>
            </div>

            <div className="flex justify-between font-medium text-black">
              <span>Total</span>
              <span className="text-black">{totalPrice > 0 ? `S$${totalPrice.toFixed(2)}` : "S$0.00"}</span>
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

