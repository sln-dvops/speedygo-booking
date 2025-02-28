"use client"
import Link from "next/link"
import { Info, MapPin, TruckIcon as TruckDelivery } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { PRICING, type ParcelSize, type CollectionMethod } from "@/types/pricing"

type CollectionMethodProps = {
  onPrevStep: () => void
  onNextStep: () => void
  selectedParcelSize: ParcelSize | null
  selectedCollectionMethod: CollectionMethod | null
  setSelectedCollectionMethod: (method: CollectionMethod) => void
}

export function CollectionMethod({
  onPrevStep,
  onNextStep,
  selectedParcelSize,
  selectedCollectionMethod,
  setSelectedCollectionMethod,
}: CollectionMethodProps) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Collection Method</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <RadioGroup
          value={selectedCollectionMethod || ""}
          onValueChange={(value) => setSelectedCollectionMethod(value as CollectionMethod)}
          className="grid gap-4"
        >
          <Label
            htmlFor="dropoff"
            className={`border border-black rounded-md p-6 cursor-pointer hover:bg-yellow-100 transition-colors ${
              selectedCollectionMethod === "dropoff" ? "bg-yellow-200" : ""
            }`}
          >
            <RadioGroupItem value="dropoff" id="dropoff" className="sr-only" />
            <div className="flex items-center">
              <div className="flex items-center flex-1 mr-8">
                <div className="mr-4 bg-yellow-400 p-3 rounded-full">
                  <MapPin className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-black mb-1">Drop off</h3>
                  <p className="text-gray-600">Drop off your parcel at any Ninja Point island-wide.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-gray-400 line-through">
                  S${selectedParcelSize ? PRICING[selectedParcelSize].dropoff.original.toFixed(2) : "5.49"}
                </span>
                <span className="bg-yellow-200 text-black px-2 py-1 rounded-md flex items-center">
                  <span className="text-yellow-500 mr-1">●</span>
                  S${selectedParcelSize ? PRICING[selectedParcelSize].dropoff.discounted.toFixed(2) : "4.49"}
                </span>
              </div>
            </div>
          </Label>

          <Label
            htmlFor="pickup"
            className={`border border-black rounded-md p-6 cursor-pointer hover:bg-yellow-100 transition-colors ${
              selectedCollectionMethod === "pickup" ? "bg-yellow-200" : ""
            }`}
          >
            <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
            <div className="flex items-center">
              <div className="flex items-center flex-1 mr-8">
                <div className="mr-4 bg-yellow-400 p-3 rounded-full">
                  <TruckDelivery className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-black mb-1">Pick up</h3>
                  <p className="text-gray-600">Let us pick up your parcel right from your doorstep.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-gray-400 line-through">
                  S${selectedParcelSize ? PRICING[selectedParcelSize].pickup.original.toFixed(2) : "8.49"}
                </span>
                <span className="bg-yellow-200 text-black px-2 py-1 rounded-md flex items-center">
                  <span className="text-yellow-500 mr-1">●</span>
                  S${selectedParcelSize ? PRICING[selectedParcelSize].pickup.discounted.toFixed(2) : "6.99"}
                </span>
              </div>
            </div>
          </Label>
        </RadioGroup>

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-4 text-black">Send a parcel within 3 working days!</h3>
          <ol className="list-decimal pl-5 space-y-2 mb-4 text-black">
            <li>Submit mailing details and make payment below.</li>
            <li>Print shipping label and attach it to your parcel.</li>
            <li>
              Drop your parcel off!
              <Link href="#" className="text-black font-semibold ml-1 hover:underline">
                Find your nearest Ninja Point
              </Link>
              .
            </li>
          </ol>
          <div className="text-gray-600">
            <p>
              Don&apos;t have a printer? Get our printed labels
              <Link href="#" className="text-black font-semibold ml-1 hover:underline">
                here
              </Link>
              .
            </p>
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
                    <li>Maximum weight: 10kg</li>
                    <li>Maximum dimensions: 50cm x 50cm x 40cm</li>
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
          disabled={!selectedCollectionMethod}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}

