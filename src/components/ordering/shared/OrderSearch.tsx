"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateOrderId } from "@/utils/orderIdUtils"

export function OrderSearch() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Function to validate and format order number
  const handleSearch = () => {
    // Reset error
    setError(null)

    // Validate the order ID
    const validOrderId = validateOrderId(orderNumber)

    if (!validOrderId) {
      setError("Please enter a valid order number")
      return
    }

    // Navigate to the order page
    router.push(`/order/${validOrderId}`)
  }

  return (
    <div className="bg-yellow-100 p-6 rounded-lg">
      <h4 className="font-medium text-black mb-3">Search Your Order</h4>
      <p className="text-sm text-gray-600 mb-4">
        Already have an order? Enter your order number below to track its status.
      </p>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter order number (e.g., 6186e845c23f or full UUID)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="border-black"
          />
        </div>
        <Button onClick={handleSearch} className="bg-black hover:bg-black/90 text-yellow-400">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

