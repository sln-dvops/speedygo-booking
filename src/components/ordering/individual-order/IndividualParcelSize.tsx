"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { ParcelForm } from "@/components/ordering/shared/parcel-components/ParcelForm"
import { ParcelList } from "@/components/ordering/shared/parcel-components/ParcelList"
import { ParcelSummary } from "@/components/ordering/shared/parcel-components/ParcelSummary"

import type { ParcelDimensions } from "@/types/pricing"

// Define ExtendedParcelDimensions
export interface ExtendedParcelDimensions extends ParcelDimensions {
  effectiveWeight: number
}

type ParcelDimensionsProps = {
  onPrevStep: () => void
  onNextStep: () => void
  selectedDimensions: ParcelDimensions[] | null
  setSelectedDimensions: (dimensions: ExtendedParcelDimensions[]) => void
}

// Move this function to the top of the file, outside of the component
const calculateEffectiveWeight = (parcel: ParcelDimensions): number => {
  const volumetricWeight = (parcel.length * parcel.width * parcel.height) / 5000
  return Math.max(parcel.weight, volumetricWeight)
}

export function ParcelDimensions({
  onPrevStep,
  onNextStep,
  selectedDimensions,
  setSelectedDimensions,
}: ParcelDimensionsProps) {
  const [currentParcel, setCurrentParcel] = useState<ParcelDimensions>({
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    effectiveWeight: 0, // Initialize with 0
  })
  const [parcels, setParcels] = useState<ParcelDimensions[]>(() =>
    selectedDimensions ? selectedDimensions.map((d) => ({ ...d, effectiveWeight: calculateEffectiveWeight(d) })) : [],
  )
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
    setCurrentParcel((prev) => {
      const updatedParcel = { ...prev, [field]: numValue }
      return {
        ...updatedParcel,
        effectiveWeight: calculateEffectiveWeight(updatedParcel),
      }
    })
  }

  // Modify the handleAddParcel function to replace the existing parcel instead of adding a new one
  const handleAddParcel = () => {
    if (isValidDimensions(currentParcel)) {
      if (editingIndex !== null) {
        // Update existing parcel
        const updatedParcels = [...parcels]
        updatedParcels[editingIndex] = currentParcel
        setParcels(updatedParcels)
        setEditingIndex(null)
      } else {
        // For individual orders, we only want one parcel
        setParcels([currentParcel])
      }

      // Reset form for next parcel
      setCurrentParcel({
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        effectiveWeight: 0,
      })
    }
  }

  const handleEditParcel = (index: number) => {
    setCurrentParcel(parcels[index])
    setEditingIndex(index)
  }

  const handleRemoveParcel = (index: number) => {
    setParcels([])

    // If we were editing this parcel, reset the form
    if (editingIndex === index) {
      setCurrentParcel({
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        effectiveWeight: 0,
      })
      setEditingIndex(null)
    }
  }

  // Update the handleContinue function
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

  // Update the ParcelForm component to show different button text based on whether a parcel exists
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Individual Parcel Details</CardTitle>
        <Badge variant="outline" className="bg-yellow-100 text-black border-black mt-2">
          Individual Order
        </Badge>
        {parcels.length > 0 && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="bg-green-100 text-black border-black">
              Parcel Added
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-yellow-100 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-black mb-2">Individual Order Information</h3>
          <p className="text-sm text-gray-600">
            Please provide the dimensions and weight of your parcel. For individual orders, you can only add one parcel.
          </p>
        </div>

        {/* Parcel Form Component */}
        {(parcels.length === 0 || editingIndex !== null) && (
          <ParcelForm
            currentParcel={currentParcel}
            handleDimensionChange={handleDimensionChange}
            handleAddParcel={handleAddParcel}
            isValidDimensions={isValidDimensions}
            editingIndex={editingIndex}
            volumetricWeight={volumetricWeight}
            effectiveWeight={effectiveWeight}
          />
        )}

        {/* Parcel List Component */}
        {parcels.length > 0 && (
          <ParcelList parcels={parcels} handleEditParcel={handleEditParcel} handleRemoveParcel={handleRemoveParcel} />
        )}

        {/* Parcel Summary Component */}
        {parcels.length > 0 && <ParcelSummary parcels={parcels} calculateTotalWeight={calculateTotalWeight} />}
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onPrevStep} className="border-black text-black hover:bg-yellow-100">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="bg-black hover:bg-black/90 text-yellow-400"
          disabled={parcels.length === 0}
        >
          Continue to Delivery Method
        </Button>
      </CardFooter>
    </Card>
  )
}

