"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { PRICING, type ParcelSize, type CollectionMethod } from "@/types/pricing"

type PaymentProps = {
  onPrevStep: () => void
  selectedParcelSize: ParcelSize | null
  selectedCollectionMethod: CollectionMethod | null
  onNextStep: () => void
}

export function Payment({ onPrevStep, selectedParcelSize, selectedCollectionMethod, onNextStep }: PaymentProps) {
  return (
    <Card className="w-full bg-white shadow-lg">
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
            <RadioGroup defaultValue="card">
              <div className="flex items-center space-x-2 border border-black p-3 rounded-md mb-2 hover:bg-yellow-100">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="text-black">
                  Credit/Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2 border border-black p-3 rounded-md hover:bg-yellow-100">
                <RadioGroupItem value="paynow" id="paynow" />
                <Label htmlFor="paynow" className="text-black">
                  PayNow
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onPrevStep} className="border-black text-black hover:bg-yellow-100">
          Back
        </Button>
        <Button onClick={onNextStep} className="bg-black hover:bg-black/90 text-yellow-400">
          Complete Order
        </Button>
      </CardFooter>
    </Card>
  )
}

