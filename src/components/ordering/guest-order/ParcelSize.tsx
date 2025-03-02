"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { ParcelDimensions } from "@/types/pricing"

type ParcelDimensionsProps = {
  onNextStep: () => void
  selectedDimensions: ParcelDimensions | null
  setSelectedDimensions: (dimensions: ParcelDimensions) => void
}

export function ParcelDimensions({ onNextStep, selectedDimensions, setSelectedDimensions }: ParcelDimensionsProps) {
  const [dimensions, setDimensions] = useState<ParcelDimensions>(
    selectedDimensions || {
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
    },
  )
  const [volumetricWeight, setVolumetricWeight] = useState(0)
  const [effectiveWeight, setEffectiveWeight] = useState(0)

  useEffect(() => {
    // Calculate volumetric weight
    const newVolumetricWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000
    setVolumetricWeight(newVolumetricWeight)

    // Calculate effective weight
    const newEffectiveWeight = Math.max(dimensions.weight, newVolumetricWeight)
    setEffectiveWeight(newEffectiveWeight)
  }, [dimensions])

  const handleDimensionChange = (field: keyof ParcelDimensions, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setDimensions((prev) => ({
      ...prev,
      [field]: numValue,
    }))
  }

  const handleContinue = () => {
    if (isValidDimensions()) {
      setSelectedDimensions(dimensions)
      onNextStep()
    }
  }

  const isValidDimensions = () => {
    return (
      dimensions.weight > 0 &&
      dimensions.weight <= 30 &&
      dimensions.length > 0 &&
      dimensions.length <= 150 &&
      dimensions.width > 0 &&
      dimensions.width <= 150 &&
      dimensions.height > 0 &&
      dimensions.height <= 150
    )
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Parcel Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="weight" className="text-base flex items-center text-black">
                <span className="text-black mr-1">*</span> Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                value={dimensions.weight || ""}
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
                  value={dimensions.length || ""}
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
                  value={dimensions.width || ""}
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
                  value={dimensions.height || ""}
                  onChange={(e) => handleDimensionChange("height", e.target.value)}
                  className="border-black"
                  min="0"
                  max="150"
                  step="0.1"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">All dimensions in centimeters (cm). Maximum: 150cm per side</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              <Image
                src="/placeholder.svg?height=300&width=300"
                alt="Parcel dimensions illustration"
                width={300}
                height={300}
                className="opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-24 h-24 text-black/20" />
              </div>
            </div>
          </div>
        </div>

        {volumetricWeight > 0 && (
          <div className="bg-yellow-100 p-4 rounded-lg space-y-2">
            <p className="text-sm text-black">
              <strong>Volumetric Weight:</strong> {volumetricWeight.toFixed(2)} kg
            </p>
            <p className="text-sm text-black">
              <strong>Actual Weight:</strong> {dimensions.weight.toFixed(2)} kg
            </p>
            <p className="text-sm text-black">
              <strong>Effective Weight:</strong> {effectiveWeight.toFixed(2)} kg
            </p>
          </div>
        )}

        <Button
          onClick={handleContinue}
          className="w-full bg-black hover:bg-black/90 text-yellow-400"
          disabled={!isValidDimensions()}
        >
          Continue to Collection Method
        </Button>
      </CardContent>
    </Card>
  )
}

