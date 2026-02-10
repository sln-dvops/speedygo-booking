import { notFound } from "next/navigation"
import { getOrderDetails } from "@/app/actions/ordering/guest-order/getOrderDetails"
import { OrderPageWrapper } from "@/components/ordering/OrderPageWrapper"

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  // Fetch order details from Supabase
  const orderDetails = await getOrderDetails(orderId)

  // If order not found, show 404
  if (!orderDetails) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-yellow-400 py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-black mb-8">Order Confirmation</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <OrderPageWrapper orderId={orderId} initialOrderDetails={orderDetails} />
        </div>
      </div>
    </div>
  )
}

