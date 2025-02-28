"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { PRICING, type ParcelSize, type CollectionMethod } from "@/types/pricing"

type PriceEstimationProps = {
  onNextStep: () => void
  selectedParcelSize: ParcelSize | null
  setSelectedParcelSize: (size: ParcelSize) => void
  selectedCollectionMethod: CollectionMethod | null
  setSelectedCollectionMethod: (method: CollectionMethod) => void
}

export function PriceEstimation({
  onNextStep,
  selectedParcelSize,
  setSelectedParcelSize,
  selectedCollectionMethod,
  setSelectedCollectionMethod,
}: PriceEstimationProps) {
  const [showCollectionMethod, setShowCollectionMethod] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const handleParcelSizeSelect = (size: ParcelSize) => {
    setSelectedParcelSize(size)
    setShowCollectionMethod(true)
    setSelectedCollectionMethod("dropoff")
    setShowInstructions(false)
  }

  const handleCollectionMethodSelect = (method: CollectionMethod) => {
    setSelectedCollectionMethod(method)
    setShowInstructions(true)
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-6">Price estimation</h2>

      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-6">
            {/* From Location */}
            <div>
              <Label htmlFor="from" className="text-base mb-2 flex items-center">
                <span className="text-red-600 mr-1">*</span> From
              </Label>
              <div className="flex">
                <div className="border rounded-l-md p-2 flex items-center">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DjTp8HXEgZxlQmASLbyIxMvGjqPcOe.png"
                    alt="Singapore flag"
                    width={30}
                    height={20}
                    className="mr-1"
                  />
                  <ChevronRight className="h-4 w-4" />
                </div>
                <Select defaultValue="singapore">
                  <SelectTrigger className="rounded-l-none w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* To Location */}
            <div>
              <Label htmlFor="to" className="text-base mb-2 flex items-center">
                <span className="text-red-600 mr-1">*</span> To
              </Label>
              <div className="flex">
                <div className="border rounded-l-md p-2 flex items-center">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DjTp8HXEgZxlQmASLbyIxMvGjqPcOe.png"
                    alt="Singapore flag"
                    width={30}
                    height={20}
                    className="mr-1"
                  />
                  <ChevronRight className="h-4 w-4" />
                </div>
                <Select defaultValue="singapore">
                  <SelectTrigger className="rounded-l-none w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parcel Size */}
            <div>
              <Label className="text-base mb-2 flex items-center">
                <span className="text-red-600 mr-1">*</span> Parcel size
              </Label>
              <RadioGroup
                value={selectedParcelSize || ""}
                onValueChange={(value) => handleParcelSizeSelect(value as ParcelSize)}
                className="grid gap-4"
              >
                <Label
                  htmlFor="2kg"
                  className={`border rounded-md p-4 flex items-center cursor-pointer hover:border-red-600 ${
                    selectedParcelSize === "2kg" ? "border-red-600" : ""
                  }`}
                >
                  <RadioGroupItem value="2kg" id="2kg" className="sr-only" />
                  <div className="mr-4">
                    <Image src="/placeholder.svg?height=50&width=50" alt="Small package" width={50} height={50} />
                  </div>
                  <div>
                    <p className="font-medium">Up to 2kg</p>
                    <p className="text-gray-500 text-sm">and 30cm x 30cm x 20cm</p>
                  </div>
                </Label>

                <Label
                  htmlFor="5kg"
                  className={`border rounded-md p-4 flex items-center cursor-pointer hover:border-red-600 ${
                    selectedParcelSize === "5kg" ? "border-red-600" : ""
                  }`}
                >
                  <RadioGroupItem value="5kg" id="5kg" className="sr-only" />
                  <div className="mr-4">
                    <Image src="/placeholder.svg?height=50&width=50" alt="Medium package" width={50} height={50} />
                  </div>
                  <div>
                    <p className="font-medium">Up to 5kg</p>
                    <p className="text-gray-500 text-sm">and 40cm x 40cm x 30cm</p>
                  </div>
                </Label>

                <Label
                  htmlFor="10kg"
                  className={`border rounded-md p-4 flex items-center cursor-pointer hover:border-red-600 ${
                    selectedParcelSize === "10kg" ? "border-red-600" : ""
                  }`}
                >
                  <RadioGroupItem value="10kg" id="10kg" className="sr-only" />
                  <div className="mr-4">
                    <Image src="/placeholder.svg?height=50&width=50" alt="Large package" width={50} height={50} />
                  </div>
                  <div>
                    <p className="font-medium">Up to 10kg</p>
                    <p className="text-gray-500 text-sm">and 50cm x 50cm x 40cm</p>
                  </div>
                </Label>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Method - Only show after parcel size is selected */}
      <AnimatePresence>
        {showCollectionMethod && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-6">
              <CardContent className="p-4 md:p-6">
                <Label className="text-base mb-4 flex items-center">
                  <span className="text-red-600 mr-1">*</span> Collection method
                </Label>

                <RadioGroup
                  value={selectedCollectionMethod || ""}
                  onValueChange={(value) => handleCollectionMethodSelect(value as CollectionMethod)}
                  className="grid gap-4"
                >
                  <Label
                    htmlFor="dropoff"
                    className={`border rounded-md p-4 cursor-pointer hover:border-red-600 ${
                      selectedCollectionMethod === "dropoff" ? "border-red-600" : ""
                    }`}
                  >
                    <RadioGroupItem value="dropoff" id="dropoff" className="sr-only" />
                    <div className="flex items-center mb-4">
                      <div className="mr-4">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Drop off icon"
                          width={40}
                          height={40}
                          className="bg-red-100 p-1 rounded"
                        />
                      </div>
                      <h3 className="font-medium">Drop off</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Drop off your parcel at any Ninja Point island-wide.</p>
                    <div className="flex items-center">
                      <span className="text-gray-400 line-through mr-2">
                        S${selectedParcelSize ? PRICING[selectedParcelSize].dropoff.original.toFixed(2) : "5.49"}
                      </span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md flex items-center">
                        <span className="text-red-600 mr-1">●</span>
                        S${selectedParcelSize ? PRICING[selectedParcelSize].dropoff.discounted.toFixed(2) : "4.49"}
                      </span>
                    </div>
                  </Label>

                  <Label
                    htmlFor="pickup"
                    className={`border rounded-md p-4 cursor-pointer hover:border-red-600 ${
                      selectedCollectionMethod === "pickup" ? "border-red-600" : ""
                    }`}
                  >
                    <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                    <div className="flex items-center mb-4">
                      <div className="mr-4">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Pick up icon"
                          width={40}
                          height={40}
                          className="bg-red-100 p-1 rounded"
                        />
                      </div>
                      <h3 className="font-medium">Pick up</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Let us pick up your parcel right from your doorstep.</p>
                    <div className="flex items-center">
                      <span className="text-gray-400 line-through mr-2">
                        S${selectedParcelSize ? PRICING[selectedParcelSize].pickup.original.toFixed(2) : "8.49"}
                      </span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md flex items-center">
                        <span className="text-red-600 mr-1">●</span>
                        S${selectedParcelSize ? PRICING[selectedParcelSize].pickup.discounted.toFixed(2) : "6.99"}
                      </span>
                    </div>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions - Only show after collection method is selected */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-6">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-semibold text-lg mb-4">Send a parcel within 3 working days!</h3>
                <ol className="list-decimal pl-5 space-y-2 mb-4">
                  <li>Submit mailing details and make payment below.</li>
                  <li>Print shipping label and attach it to your parcel.</li>
                  <li>
                    Drop your parcel off!
                    <Link href="#" className="text-red-600 ml-1 hover:underline">
                      Find your nearest Ninja Point
                    </Link>
                    .
                  </li>
                </ol>
                <p className="text-gray-600">
                  Don&apos;t have a printer? Get our printed labels
                  <Link href="#" className="text-red-600 ml-1 hover:underline">
                    here
                  </Link>
                  .
                </p>
                <p className="text-gray-600 flex items-center mt-4">
                  Please ensure that your parcel meets our guidelines.
                  <Info className="h-4 w-4 text-red-600 ml-1" />
                </p>
              </CardContent>
              <CardFooter className="px-4 md:px-6 py-4 flex justify-end">
                <Button
                  onClick={onNextStep}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!selectedParcelSize || !selectedCollectionMethod}
                >
                  Next
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

