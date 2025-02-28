"use client"

import Image from "next/image"
import { ChevronRight, Package, PackageCheck, PackagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { ParcelSize } from "@/types/pricing"

type ParcelSizeProps = {
  onNextStep: () => void
  selectedParcelSize: ParcelSize | null
  setSelectedParcelSize: (size: ParcelSize) => void
}

export function ParcelSize({ onNextStep, selectedParcelSize, setSelectedParcelSize }: ParcelSizeProps) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Parcel Size</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* From Location */}
        <div className="space-y-2">
          <Label htmlFor="from" className="text-base flex items-center text-black">
            <span className="text-black mr-1">*</span> From
          </Label>
          <div className="flex">
            <div className="border border-black rounded-l-md px-2 flex items-center h-[42px]">
              <Image src="/icons/sg-flag-rect.svg" alt="Singapore flag" width={30} height={20} className="mr-1" />
              <ChevronRight className="h-4 w-4 text-black" />
            </div>
            <Select defaultValue="singapore">
              <SelectTrigger className="rounded-l-none w-full border-black text-black h-[42px]">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="singapore">Singapore</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* To Location */}
        <div className="space-y-2">
          <Label htmlFor="to" className="text-base flex items-center text-black">
            <span className="text-black mr-1">*</span> To
          </Label>
          <div className="flex">
            <div className="border border-black rounded-l-md px-2 flex items-center h-[42px]">
              <Image src="/icons/sg-flag-rect.svg" alt="Singapore flag" width={30} height={20} className="mr-1" />
              <ChevronRight className="h-4 w-4 text-black" />
            </div>
            <Select defaultValue="singapore">
              <SelectTrigger className="rounded-l-none w-full border-black text-black h-[42px]">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="singapore">Singapore</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Parcel Size */}
        <div className="space-y-4">
          <Label className="text-base flex items-center text-black">
            <span className="text-black mr-1">*</span> Parcel size
          </Label>
          <RadioGroup
            value={selectedParcelSize || ""}
            onValueChange={(value) => setSelectedParcelSize(value as ParcelSize)}
            className="grid gap-4"
          >
            <Label
              htmlFor="2kg"
              className={`border border-black rounded-md p-6 flex items-center cursor-pointer hover:bg-yellow-100 transition-colors ${
                selectedParcelSize === "2kg" ? "bg-yellow-200" : ""
              }`}
            >
              <RadioGroupItem value="2kg" id="2kg" className="sr-only" />
              <div className="mr-4 bg-yellow-400 p-2 rounded-full">
                <Package className="w-12 h-12 text-black" />
              </div>
              <div>
                <p className="font-medium text-lg text-black">Up to 2kg</p>
                <p className="text-black text-sm">and 30cm x 30cm x 20cm</p>
              </div>
            </Label>

            <Label
              htmlFor="5kg"
              className={`border border-black rounded-md p-6 flex items-center cursor-pointer hover:bg-yellow-100 transition-colors ${
                selectedParcelSize === "5kg" ? "bg-yellow-200" : ""
              }`}
            >
              <RadioGroupItem value="5kg" id="5kg" className="sr-only" />
              <div className="mr-4 bg-yellow-400 p-2 rounded-full">
                <PackageCheck className="w-12 h-12 text-black" />
              </div>
              <div>
                <p className="font-medium text-lg text-black">Up to 5kg</p>
                <p className="text-black text-sm">and 40cm x 40cm x 30cm</p>
              </div>
            </Label>

            <Label
              htmlFor="10kg"
              className={`border border-black rounded-md p-6 flex items-center cursor-pointer hover:bg-yellow-100 transition-colors ${
                selectedParcelSize === "10kg" ? "bg-yellow-200" : ""
              }`}
            >
              <RadioGroupItem value="10kg" id="10kg" className="sr-only" />
              <div className="mr-4 bg-yellow-400 p-2 rounded-full">
                <PackagePlus className="w-12 h-12 text-black" />
              </div>
              <div>
                <p className="font-medium text-lg text-black">Up to 10kg</p>
                <p className="text-black text-sm">and 50cm x 50cm x 40cm</p>
              </div>
            </Label>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={onNextStep}
          className="bg-black hover:bg-black/90 text-yellow-400 font-semibold px-6 py-2"
          disabled={!selectedParcelSize}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}

