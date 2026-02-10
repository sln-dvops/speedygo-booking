"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { CsvUploader } from "./parcel-components/CsvUploader"
import { ParcelForm } from "./parcel-components/ParcelForm"
import { ParcelList } from "./parcel-components/ParcelList"
import { ParcelSummary } from "./parcel-components/ParcelSummary"

import type { ParcelDimensions } from "@/types/pricing"
import type { RecipientDetails } from "@/types/order"

// Define ExtendedParcelDimensions
export interface ExtendedParcelDimensions extends ParcelDimensions {
  effectiveWeight: number
}

type ParcelDimensionsProps = {
  onNextStep: () => void
  selectedDimensions: ParcelDimensions[] | null
  setSelectedDimensions: (dimensions: ExtendedParcelDimensions[]) => void
  setRecipients: React.Dispatch<React.SetStateAction<RecipientDetails[]>>
  isBulkOrder?: boolean
}

// Move this function to the top of the file, outside of the component
const calculateEffectiveWeight = (parcel: ParcelDimensions): number => {
  const volumetricWeight = (parcel.length * parcel.width * parcel.height) / 5000
  return Math.max(parcel.weight, volumetricWeight)
}

export function ParcelDimensions({
  onNextStep,
  selectedDimensions,
  setSelectedDimensions,
  setRecipients,
  isBulkOrder = false,
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

  // Helper function to calculate effective weight
  // const calculateEffectiveWeight = (parcel: ParcelDimensions): number => {
  //   const volumetricWeight = (parcel.length * parcel.width * parcel.height) / 5000
  //   return Math.max(parcel.weight, volumetricWeight)
  // }

  // Modify the handleAddParcel function
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
        effectiveWeight: 0,
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

  // Wrap setRecipients in useCallback to avoid unnecessary re-renders
  const handleSetRecipients = useCallback(
    (newRecipients: RecipientDetails[]) => {
      setRecipients(newRecipients)
    },
    [setRecipients],
  )

  // Update the setParcels function to convert ParcelDimensions to ExtendedParcelDimensions
  const handleSetParcels = (newParcels: ParcelDimensions[]) => {
    const extendedParcels: ExtendedParcelDimensions[] = newParcels.map((parcel) => ({
      ...parcel,
      effectiveWeight: calculateEffectiveWeight(parcel),
    }))
    setParcels(extendedParcels)
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Parcel Details</CardTitle>
        {isBulkOrder && (
          <Badge variant="outline" className="bg-yellow-200 text-black border-black mt-2">
            Bulk Order
          </Badge>
        )}
        {parcels.length > 0 && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="bg-yellow-100 text-black border-black">
              {parcels.length} {parcels.length === 1 ? "Parcel" : "Parcels"}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {isBulkOrder && (
          <div className="bg-yellow-100 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-black mb-2">Bulk Order Information</h3>
            <p className="text-sm text-gray-600">
              For bulk orders, you can add multiple parcels here. In the next steps, you&apos;ll be able to specify
              different recipient addresses for each parcel.
            </p>
          </div>
        )}

        {/* CSV Upload Component - Only show for bulk orders */}
        {isBulkOrder && (
          <CsvUploader
            setParcels={handleSetParcels}
            setRecipients={handleSetRecipients}
            isValidDimensions={isValidDimensions}
          />
        )}

        {/* Parcel Form Component */}
        <ParcelForm
          currentParcel={currentParcel}
          handleDimensionChange={handleDimensionChange}
          handleAddParcel={handleAddParcel}
          isValidDimensions={isValidDimensions}
          editingIndex={editingIndex}
          volumetricWeight={volumetricWeight}
          effectiveWeight={effectiveWeight}
        />

        {/* Parcel List Component */}
        {parcels.length > 0 && (
          <ParcelList parcels={parcels} handleEditParcel={handleEditParcel} handleRemoveParcel={handleRemoveParcel} />
        )}

        {/* Parcel Summary Component */}
        {parcels.length > 0 && <ParcelSummary parcels={parcels} calculateTotalWeight={calculateTotalWeight} />}
      </CardContent>
      <CardFooter className="px-6 py-4">
        <Button
          onClick={handleContinue}
          className="w-full bg-black hover:bg-black/90 text-yellow-400"
          disabled={parcels.length === 0 || (isBulkOrder && parcels.length < 2)}
        >
          Continue to Delivery Method
        </Button>
        {isBulkOrder && parcels.length < 2 && (
          <p className="text-sm text-red-500 mt-2">Please add at least 2 parcels for a bulk order.</p>
        )}
      </CardFooter>
    </Card>
  )
}

