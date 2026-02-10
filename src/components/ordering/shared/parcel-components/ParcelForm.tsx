"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { ParcelDimensions } from "@/types/pricing"
import { getPricingTier, calculateVolumetricWeight } from "@/types/pricing"

interface ParcelFormProps {
  currentParcel: ParcelDimensions
  handleDimensionChange: (field: keyof ParcelDimensions, value: string) => void
  handleAddParcel: () => void
  isValidDimensions: (dimensions: ParcelDimensions) => boolean
  editingIndex: number | null
}

export function ParcelForm({
  currentParcel,
  handleDimensionChange,
  handleAddParcel,
  isValidDimensions,
  editingIndex,
}: ParcelFormProps) {
  // Use the functions from pricing.ts for calculations
  const showWeightInfo =
    currentParcel.weight > 0 && currentParcel.length > 0 && currentParcel.width > 0 && currentParcel.height > 0

  // Only calculate if all values are present
  let tierInfo = null
  let volumetricWeight = 0

  if (showWeightInfo) {
    volumetricWeight = calculateVolumetricWeight(currentParcel.length, currentParcel.width, currentParcel.height)

    tierInfo = getPricingTier(currentParcel)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="weight" className="text-base flex items-center text-black">
            <span className="text-black mr-1">*</span> Weight (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            value={currentParcel.weight || ""}
            onChange={(e) => handleDimensionChange("weight", e.target.value)}
            className="border-black"
            min="0"
            max="30"
            step="0.1"
          />
          <p className="text-sm text-gray-500 mt-1">Maximum weight: 30kg</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="length" className="text-base flex items-center text-black">
              <span className="text-black mr-1">*</span> Length
            </Label>
            <Input
              id="length"
              type="number"
              value={currentParcel.length || ""}
              onChange={(e) => handleDimensionChange("length", e.target.value)}
              className="border-black"
              min="0"
              max="150"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="width" className="text-base flex items-center text-black">
              <span className="text-black mr-1">*</span> Width
            </Label>
            <Input
              id="width"
              type="number"
              value={currentParcel.width || ""}
              onChange={(e) => handleDimensionChange("width", e.target.value)}
              className="border-black"
              min="0"
              max="150"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-base flex items-center text-black">
              <span className="text-black mr-1">*</span> Height
            </Label>
            <Input
              id="height"
              type="number"
              value={currentParcel.height || ""}
              onChange={(e) => handleDimensionChange("height", e.target.value)}
              className="border-black"
              min="0"
              max="150"
              step="0.1"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">All dimensions in centimeters (cm). Maximum: 150cm per side</p>

        <Button
          onClick={handleAddParcel}
          className="w-full bg-black hover:bg-black/90 text-yellow-400 mt-4"
          disabled={!isValidDimensions(currentParcel)}
        >
          {editingIndex !== null ? "Update Parcel" : "Add Parcel"}
        </Button>
      </div>

      <div className="flex flex-col">
        <div className="relative mb-4">
          <Image
            src="/images/Package_cartoon.png"
            alt="Parcel dimensions illustration"
            width={300}
            height={300}
            className="opacity-80 mx-auto"
            priority
          />
        </div>

        {showWeightInfo && tierInfo && (
          <div className="bg-yellow-100 p-4 rounded-lg space-y-2 mb-4">
            <div className="space-y-2">
              <p className="text-sm text-black">
                <strong>Actual Weight:</strong> {currentParcel.weight.toFixed(2)} kg{" "}
                <span className="text-xs">({tierInfo.actualWeightTier.name})</span>
              </p>
              <p className="text-sm text-black">
                <strong>Volumetric Weight:</strong> {volumetricWeight.toFixed(2)} kg{" "}
                <span className="text-xs">({tierInfo.volumetricWeightTier.name})</span>
              </p>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <p className="text-sm font-medium text-black">
                <strong>Pricing Tier:</strong> {tierInfo.tier.name} (${tierInfo.tier.price.toFixed(2)})
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
