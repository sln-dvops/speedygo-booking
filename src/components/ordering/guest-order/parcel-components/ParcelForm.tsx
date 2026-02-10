"use client"

import Image from "next/image"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { ParcelDimensions } from "@/types/pricing"

interface ParcelFormProps {
  currentParcel: ParcelDimensions
  handleDimensionChange: (field: keyof ParcelDimensions, value: string) => void
  handleAddParcel: () => void
  isValidDimensions: (dimensions: ParcelDimensions) => boolean
  editingIndex: number | null
  volumetricWeight: number
  effectiveWeight: number
}

export function ParcelForm({
  currentParcel,
  handleDimensionChange,
  handleAddParcel,
  isValidDimensions,
  editingIndex,
  volumetricWeight,
  effectiveWeight,
}: ParcelFormProps) {
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
            src="/placeholder.svg?height=150&width=150"
            alt="Parcel dimensions illustration"
            width={150}
            height={150}
            className="opacity-80 mx-auto"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-16 h-16 text-black/20" />
          </div>
        </div>

        {volumetricWeight > 0 && (
          <div className="bg-yellow-100 p-4 rounded-lg space-y-2 mb-4">
            <p className="text-sm text-black">
              <strong>Volumetric Weight:</strong> {volumetricWeight.toFixed(2)} kg
            </p>
            <p className="text-sm text-black">
              <strong>Actual Weight:</strong> {currentParcel.weight.toFixed(2)} kg
            </p>
            <p className="text-sm text-black">
              <strong>Effective Weight:</strong> {effectiveWeight.toFixed(2)} kg
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

