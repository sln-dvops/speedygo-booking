import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-yellow-400 py-12">
      <div className="container mx-auto max-w-[800px] px-4">
        <Card className="bg-white shadow-lg text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold text-black">404</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-6">
              <Package className="h-20 w-20 mx-auto text-yellow-400 mb-4" />
              <h2 className="text-2xl font-bold text-black mb-2">Order Not Found</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn&apos;t find the order you&apos;re looking for. It may have expired or the order ID is
                incorrect.
              </p>
            </div>
            <Button className="bg-black hover:bg-black/90 text-yellow-400 px-6" asChild>
              <Link href="/">Back to Ordering Page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

