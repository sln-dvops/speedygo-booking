"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function OrderSearch() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Function to validate and format UUID
  const handleSearch = () => {
    // Reset error
    setError(null)

    // Clean the input (remove spaces and any non-alphanumeric characters except hyphens)
    let cleanedInput = orderNumber.trim().replace(/[^a-zA-Z0-9-]/g, "")

    // Check if it's a valid UUID format (with or without hyphens)
    const uuidRegexWithHyphens = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const uuidRegexWithoutHyphens = /^[0-9a-f]{32}$/i

    // If input has no hyphens but is 32 chars, add hyphens
    if (uuidRegexWithoutHyphens.test(cleanedInput)) {
      cleanedInput = [
        cleanedInput.slice(0, 8),
        cleanedInput.slice(8, 12),
        cleanedInput.slice(12, 16),
        cleanedInput.slice(16, 20),
        cleanedInput.slice(20),
      ].join("-")
    }

    // Final validation
    if (!uuidRegexWithHyphens.test(cleanedInput)) {
      setError("Please enter a valid order number")
      return
    }

    // Navigate to the order page
    router.push(`/order/${cleanedInput}`)
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
            placeholder="Enter order number (e.g., cfd3de32-a403-4abf-bc1e-c23f6186e845)"
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

