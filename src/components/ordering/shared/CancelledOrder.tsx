import Link from "next/link"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CancelledOrderProps {
  orderId: string
}

export function CancelledOrder({ orderId }: CancelledOrderProps) {
  return (
    <div className="text-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-bold text-black">Payment Cancelled</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="py-6">
          <XCircle className="h-20 w-20 mx-auto text-red-500 mb-4" />
          <p className="text-gray-600 max-w-md mx-auto">
            Your order (#{orderId.slice(0, 8)}) has been saved, but the payment was not completed. You&apos;ll need to create
            a new order to complete your purchase.
          </p>
        </div>
        <Button className="bg-black hover:bg-black/90 text-yellow-400 px-6" asChild>
          <Link href="/">Create New Order</Link>
        </Button>
      </CardContent>
    </div>
  )
}

