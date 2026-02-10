"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { ParcelDimensions } from "@/types/pricing"

interface ParcelListProps {
  parcels: ParcelDimensions[]
  handleEditParcel: (index: number) => void
  handleRemoveParcel: (index: number) => void
}

export function ParcelList({ parcels, handleEditParcel, handleRemoveParcel }: ParcelListProps) {
  return (
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
    </div>
  )
}

