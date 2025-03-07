"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Package, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { ParcelDimensions } from "@/types/pricing"

type ParcelDimensionsProps = {
  onNextStep: () => void
  selectedDimensions: ParcelDimensions[] | null
  setSelectedDimensions: (dimensions: ParcelDimensions[]) => void
}

export function ParcelDimensions({ onNextStep, selectedDimensions, setSelectedDimensions }: ParcelDimensionsProps) {
  const [currentParcel, setCurrentParcel] = useState<ParcelDimensions>({
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
  })
  const [parcels, setParcels] = useState<ParcelDimensions[]>(selectedDimensions || [])
  const [volumetricWeight, setVolumetricWeight] = useState(0)
  const [effectiveWeight, setEffectiveWeight] = useState(0)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    // Calculate volumetric weight
    const newVolumetricWeight = (currentParcel.length * currentParcel.width * currentParcel.height) / 5000
    setVolumetricWeight(newVolumetricWeight)

    // Calculate effective weight
    const newEffectiveWeight = Math.max(currentParcel.weight, newVolumetricWeight)
    setEffectiveWeight(newEffectiveWeight)
  }, [currentParcel])

  const handleDimensionChange = (field: keyof ParcelDimensions, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setCurrentParcel((prev) => ({
      ...prev,
      [field]: numValue,
    }))
  }

  const handleAddParcel = () => {
    if (isValidDimensions(currentParcel)) {
      if (editingIndex !== null) {
        // Update existing parcel
        const updatedParcels = [...parcels]
        updatedParcels[editingIndex] = currentParcel
        setParcels(updatedParcels)
        setEditingIndex(null)
      } else {
        // Add new parcel
        setParcels([...parcels, currentParcel])
      }

      // Reset form for next parcel
      setCurrentParcel({
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
      })
    }
  }

  const handleEditParcel = (index: number) => {
    setCurrentParcel(parcels[index])
    setEditingIndex(index)
  }

  const handleRemoveParcel = (index: number) => {
    const updatedParcels = parcels.filter((_, i) => i !== index)
    setParcels(updatedParcels)

    // If we were editing this parcel, reset the form
    if (editingIndex === index) {
      setCurrentParcel({
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
      })
      setEditingIndex(null)
    }
  }

  const handleContinue = () => {
    if (parcels.length > 0) {
      setSelectedDimensions(parcels)
      onNextStep()
    }
  }

  const isValidDimensions = (dimensions: ParcelDimensions) => {
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

  const calculateTotalWeight = () => {
    return parcels.reduce((total, parcel) => total + parcel.weight, 0)
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Parcel Details</CardTitle>
        {parcels.length > 0 && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="bg-yellow-100 text-black border-black">
              {parcels.length} {parcels.length === 1 ? "Parcel" : "Parcels"}
            </Badge>
            {parcels.length > 1 && (
              <Badge variant="outline" className="ml-2 bg-yellow-200 text-black border-black">
                Bulk Order
              </Badge>
            )}
          </div>
        )}
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

        {parcels.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Your Parcels</h3>
            <ScrollArea className="h-[200px] rounded-md border border-black p-4">
              <div className="space-y-4">
                {parcels.map((parcel, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-black">Parcel {index + 1}</p>
                      <p className="text-sm text-gray-600">
                        {parcel.weight}kg • {parcel.length}cm × {parcel.width}cm × {parcel.height}cm
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-black text-black hover:bg-yellow-100"
                        onClick={() => handleEditParcel(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-600 hover:bg-red-100"
                        onClick={() => handleRemoveParcel(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="font-medium text-black">Total Parcels:</p>
                <p className="font-medium text-black">{parcels.length}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="font-medium text-black">Total Weight:</p>
                <p className="font-medium text-black">{calculateTotalWeight().toFixed(2)} kg</p>
              </div>
              {parcels.length > 1 && (
                <div className="mt-2 pt-2 border-t border-black/20">
                  <p className="text-sm text-black font-medium">This will be processed as a bulk order.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-6 py-4">
        <Button
          onClick={handleContinue}
          className="w-full bg-black hover:bg-black/90 text-yellow-400"
          disabled={parcels.length === 0}
        >
          Continue to Collection Method
        </Button>
      </CardFooter>
    </Card>
  )
}

