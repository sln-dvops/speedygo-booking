"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { CsvUploader } from "./parcel-components/CsvUploader"
import { ParcelForm } from "./parcel-components/ParcelForm"
import { ParcelList } from "./parcel-components/ParcelList"
import { ParcelSummary } from "./parcel-components/ParcelSummary"

import type { ParcelDimensions } from "@/types/pricing"
import type { RecipientDetails } from "@/types/order"

type ParcelDimensionsProps = {
  onNextStep: () => void
  selectedDimensions: ParcelDimensions[] | null
  setSelectedDimensions: (dimensions: ParcelDimensions[]) => void
  setRecipients: React.Dispatch<React.SetStateAction<RecipientDetails[]>>
  isBulkOrder?: boolean
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
  })

  const [parcels, setParcels] = useState<ParcelDimensions[]>(
    selectedDimensions ?? []
  )

  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleWeightChange = (value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setCurrentParcel({ weight: numValue })
  }

  const isValidDimensions = (parcel: ParcelDimensions) => {
    return parcel.weight > 0 && parcel.weight <= 30
  }

  const handleAddParcel = () => {
    if (!isValidDimensions(currentParcel)) return

    if (editingIndex !== null) {
      const updated = [...parcels]
      updated[editingIndex] = currentParcel
      setParcels(updated)
      setEditingIndex(null)
    } else {
      setParcels([...parcels, currentParcel])
    }

    setCurrentParcel({ weight: 0 })
  }

  const handleEditParcel = (index: number) => {
    setCurrentParcel(parcels[index])
    setEditingIndex(index)
  }

  const handleRemoveParcel = (index: number) => {
    const updated = parcels.filter((_, i) => i !== index)
    setParcels(updated)

    if (editingIndex === index) {
      setCurrentParcel({ weight: 0 })
      setEditingIndex(null)
    }
  }

  const handleContinue = () => {
    if (parcels.length > 0) {
      setSelectedDimensions(parcels)
      onNextStep()
    }
  }

  const calculateTotalWeight = () => {
    return parcels.reduce((total, parcel) => total + parcel.weight, 0)
  }

  const handleSetRecipients = useCallback(
    (newRecipients: RecipientDetails[]) => {
      setRecipients(newRecipients)
    },
    [setRecipients]
  )

  const handleSetParcels = (newParcels: ParcelDimensions[]) => {
    setParcels(newParcels)
  }

  function handleDimensionChange(field: keyof ParcelDimensions, value: string): void {
    throw new Error("Function not implemented.")
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">
          Parcel Details
        </CardTitle>

        {isBulkOrder && (
          <Badge
            variant="outline"
            className="bg-yellow-200 text-black border-black mt-2"
          >
            Bulk Order
          </Badge>
        )}

        {parcels.length > 0 && (
          <div className="flex items-center mt-2">
            <Badge
              variant="outline"
              className="bg-yellow-100 text-black border-black"
            >
              {parcels.length}{" "}
              {parcels.length === 1 ? "Parcel" : "Parcels"}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {isBulkOrder && (
          <div className="bg-yellow-100 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-black mb-2">
              Bulk Order Information
            </h3>
            <p className="text-sm text-gray-600">
              Add multiple parcels here. Each parcel is priced based on weight.
            </p>
          </div>
        )}

        {isBulkOrder && (
          <CsvUploader
            setParcels={handleSetParcels}
            setRecipients={handleSetRecipients}
            isValidDimensions={isValidDimensions}
          />
        )}

        <ParcelForm
          currentParcel={currentParcel}
          handleDimensionChange={handleDimensionChange}
          handleAddParcel={handleAddParcel}
          editingIndex={editingIndex}
        />

        {parcels.length > 0 && (
          <ParcelList
            parcels={parcels}
            handleEditParcel={handleEditParcel}
            handleRemoveParcel={handleRemoveParcel}
          />
        )}

        {parcels.length > 0 && (
          <ParcelSummary
            parcels={parcels}
            calculateTotalWeight={calculateTotalWeight}
          />
        )}
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
          <p className="text-sm text-red-500 mt-2">
            Please add at least 2 parcels for a bulk order.
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
