"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateOrderId } from "@/utils/orderIdUtils"

export function OrderSearch() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Function to validate and format order number
  const handleSearch = () => {
    // Reset error
    setError(null)

    // Set loading state to true
    setIsLoading(true)

    try {
      // Validate the order ID
      const validOrderId = validateOrderId(orderNumber)

      if (!validOrderId) {
        setError("Please enter a valid order number")
        setIsLoading(false)
        return
      }

      // Navigate to the order page
      router.push(`/order/${validOrderId}`)

      // Note: router.push doesn't return a Promise in Next.js
      // The loading state will be reset when the new page loads
      // or when this component unmounts
    } catch (error: unknown) {
      console.error("Navigation error:", error)
      setIsLoading(false)
      setError("An error occurred while searching. Please try again.")
    }
  }

  useEffect(() => {
    return () => {
      // Reset loading state when component unmounts
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="bg-yellow-100 p-6 rounded-lg">
      <h4 className="font-medium text-black mb-3">For Sellers</h4>
      <p className="text-sm text-gray-600 mb-4">
        Search your existing order below to check waybill and delivery status.
      </p>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter order number (e.g., SPDY6186e845c23f)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="border-black"
          />
        </div>
        <Button onClick={handleSearch} className="bg-black hover:bg-black/90 text-yellow-400" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </span>
          ) : (
            <span className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search
            </span>
          )}
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
