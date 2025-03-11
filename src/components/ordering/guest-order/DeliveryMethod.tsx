"use client"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import type { DeliveryMethod as DeliveryMethodType, ParcelDimensions } from "@/types/pricing"
import { calculateShippingPrice } from "@/types/pricing"

// Update the props type to include effectiveWeight and make selectedDimensions optional
type DeliveryMethodProps = {
  onPrevStep: () => void
  onNextStep: () => void
  selectedDimensions?: ParcelDimensions[]
  isBulkOrder?: boolean
  totalParcels?: number
  totalWeight?: number
  selectedDeliveryMethod: DeliveryMethodType | undefined
  setSelectedDeliveryMethod: (method: DeliveryMethodType) => void
}

export function DeliveryMethod({
  onPrevStep,
  onNextStep,
  selectedDimensions = [],
  isBulkOrder = false,
  totalParcels = 1,
  selectedDeliveryMethod,
  setSelectedDeliveryMethod,
}: DeliveryMethodProps) {
  // Calculate the total weight for display purposes
  const calculatedTotalWeight = selectedDimensions.reduce((sum, parcel) => sum + parcel.weight, 0)

  // Replace the existing calculateBulkPrice function with this one
  const calculateBulkPrice = () => {
    if (!selectedDeliveryMethod) return 0

    return selectedDimensions.reduce((total, parcel) => {
      const parcelPrice = calculateShippingPrice(parcel, selectedDeliveryMethod)
      return total + parcelPrice
    }, 0)
  }

  const finalPrice = isBulkOrder
    ? calculateBulkPrice()
    : selectedDimensions.length > 0 && selectedDeliveryMethod
      ? calculateShippingPrice(selectedDimensions[0], selectedDeliveryMethod)
      : 0

  if (selectedDimensions.length === 0) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">No parcel dimensions selected. Please go back and add parcel details.</p>
        </CardContent>
        <CardFooter className="px-6 py-4">
          <Button variant="outline" onClick={onPrevStep} className="border-black text-black hover:bg-yellow-100">
            Back
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Delivery Method</CardTitle>
        {isBulkOrder && (
          <Badge variant="outline" className="bg-yellow-200 text-black border-black mt-2">
            Bulk Order ({totalParcels} Parcels)
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="font-medium text-lg text-black mb-4">Delivery Method</h3>
          <RadioGroup
            value={selectedDeliveryMethod || ""}
            onValueChange={(value) => setSelectedDeliveryMethod(value as DeliveryMethodType)}
            className="grid gap-4"
          >
            <Label
              className={`border border-black rounded-lg p-4 cursor-pointer hover:bg-yellow-100 ${
                selectedDeliveryMethod === "atl" ? "bg-yellow-200" : ""
              }`}
            >
              <RadioGroupItem value="atl" className="sr-only" />
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-black">Authorized to Leave (ATL)</p>
                  <p className="text-sm text-gray-600">Parcel will be left at a safe location</p>
                </div>
                <span className="text-black font-medium">Free</span>
              </div>
            </Label>

            <Label
              className={`border border-black rounded-lg p-4 cursor-pointer hover:bg-yellow-100 ${
                selectedDeliveryMethod === "hand-to-hand" ? "bg-yellow-200" : ""
              }`}
            >
              <RadioGroupItem value="hand-to-hand" className="sr-only" />
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-black">Hand to Hand</p>
                  <p className="text-sm text-gray-600">Parcel will be handed directly to recipient</p>
                </div>
                <span className="text-black font-medium">+$2.50</span>
              </div>
            </Label>
          </RadioGroup>
        </div>

        {isBulkOrder && selectedDeliveryMethod && (
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
            <h4 className="font-medium text-black mb-2">Bulk Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Parcels:</span>
                <span>{selectedDimensions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Weight:</span>
                <span>{calculatedTotalWeight.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Price Per Parcel:</span>
                <span>${(finalPrice / selectedDimensions.length).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {selectedDeliveryMethod && (
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
            <p className="text-lg font-medium text-black">Total Price: ${finalPrice.toFixed(2)}</p>
          </div>
        )}

        <div className="mt-6">
          <div className="text-gray-600">
            <div className="flex items-center mt-4">
              <span>Please ensure that your parcel meets our guidelines.</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto ml-1">
                    <Info className="h-4 w-4 text-black" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Parcel Guidelines</DialogTitle>
                    <DialogDescription>Please ensure your parcel meets the following guidelines:</DialogDescription>
                  </DialogHeader>
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                    <li>Maximum weight: 30kg</li>
                    <li>Maximum dimensions: 150cm x 150cm x 150cm</li>
                    <li>No prohibited items (e.g., dangerous goods, perishables)</li>
                    <li>Properly packaged to prevent damage during transit</li>
                    <li>Clear labeling with sender and recipient information</li>
                  </ul>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onPrevStep} className="border-black text-black hover:bg-yellow-100">
          Back
        </Button>
        <Button
          onClick={onNextStep}
          className="bg-black hover:bg-black/90 text-yellow-400"
          disabled={!selectedDeliveryMethod}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}

