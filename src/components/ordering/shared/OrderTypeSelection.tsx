"use client"

import { Package, PackageIcon as Packages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderSearch } from "@/components/ordering/shared/OrderSearch"
import { ParcelSearch } from "@/components/ordering/shared/ParcelSearch"

type OrderType = "individual" | "bulk"

interface OrderTypeSelectionProps {
  onNextStep: (orderType: OrderType) => void
}

export function OrderTypeSelection({ onNextStep }: OrderTypeSelectionProps) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Select Order Type</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="border-2 border-black rounded-lg p-6 hover:bg-yellow-100 cursor-pointer transition-colors flex flex-col items-center text-center"
            onClick={() => onNextStep("individual")}
          >
            <Package className="h-16 w-16 text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-2">Individual Order</h3>
            <p className="text-gray-600">
              Send a single parcel to one recipient. Perfect for sending gifts, documents, or small items.
            </p>
            <Button
              className="mt-4 bg-black hover:bg-black/90 text-yellow-400"
              onClick={(e) => {
                e.stopPropagation()
                onNextStep("individual")
              }}
            >
              Select Individual
            </Button>
          </div>

          <div
            className="border-2 border-black rounded-lg p-6 hover:bg-yellow-100 cursor-pointer transition-colors flex flex-col items-center text-center"
            onClick={() => onNextStep("bulk")}
          >
            <Packages className="h-16 w-16 text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-2">Bulk Order</h3>
            <p className="text-gray-600">
              Send multiple parcels to different recipients. Ideal for businesses or sending to multiple family members.
            </p>
            <Button
              className="mt-4 bg-black hover:bg-black/90 text-yellow-400"
              onClick={(e) => {
                e.stopPropagation()
                onNextStep("bulk")
              }}
            >
              Select Bulk
            </Button>
          </div>
        </div>

        <OrderSearch />
        <ParcelSearch />
      </CardContent>
    </Card>
  )
}

