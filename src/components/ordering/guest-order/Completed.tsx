import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function Completed() {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-black">Thank You!</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 p-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <p className="text-lg text-center text-black">
          Your order has been successfully placed and is being processed.
        </p>
        <p className="text-sm text-center text-gray-600">
          You will receive a confirmation email shortly with your order details and tracking information.
        </p>
        <p className="text-sm text-center text-gray-600">
          Thank you for choosing Speedy Xpress for your delivery needs!
        </p>
      </CardContent>
    </Card>
  )
}

