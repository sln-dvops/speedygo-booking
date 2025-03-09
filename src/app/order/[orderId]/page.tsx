import { notFound } from "next/navigation"
import { getOrderDetails } from "@/app/actions/ordering/guest-order/getOrderDetails"
import { OrderStatusRefresher } from "@/components/ordering/guest-order/OrderStatusRefresher"

interface OrderPageProps {
  params: {
    orderId: string
  }
  searchParams?: {
    status?: string
    reference?: string
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  // Await the params object before accessing its properties
  const resolvedParams = await params
  const orderId = resolvedParams.orderId

  // Fetch order details from Supabase
  const orderDetails = await getOrderDetails(orderId)

  // If order not found, show 404
  if (!orderDetails) {
    notFound()
  }

  // IMPORTANT: We don't mark the order as paid based on URL parameters
  // We only use the database status which is updated by the webhook
  // This follows HitPay's security recommendation
  const initialStatus = orderDetails.status || "pending"

  return (
    <div className="min-h-screen bg-yellow-400 py-12">
      <div className="container mx-auto max-w-5xl px-4">
        {" "}
        {/* Increased max-width */}
        <h1 className="text-4xl font-extrabold tracking-tight text-black mb-8">Order Confirmation</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {" "}
          {/* Increased padding */}
          <OrderStatusRefresher orderId={orderId} initialStatus={initialStatus} orderDetails={orderDetails} />
        </div>
      </div>
    </div>
  )
}

