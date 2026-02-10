"use client"

import type { ParcelDimensions } from "@/types/pricing"

interface ParcelSummaryProps {
  parcels: ParcelDimensions[]
  calculateTotalWeight: () => number
}

export function ParcelSummary({ parcels, calculateTotalWeight }: ParcelSummaryProps) {
  return (
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
  )
}

