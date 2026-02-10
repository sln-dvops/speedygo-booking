import type { Metadata } from "next"
import { OrderFlow } from "@/components/ordering/OrderFlow"

export const metadata: Metadata = {
  title: "Speedy Xpress: Create a delivery order",
  description: "Create a one-time delivery order with Speedy Xpress",
}

export default function OrderPage() {
  return <OrderFlow />
}

