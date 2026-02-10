"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OrderTypeSelection } from "@/components/ordering/shared/OrderTypeSelection"
import { IndividualOrderFlow } from "@/components/ordering/individual-order/IndividualOrderFlow"
import { BulkOrderFlow } from "@/components/ordering/bulk-order/BulkOrderFlow"

type OrderType = "individual" | "bulk" | null

export function OrderFlow() {
  const [orderType, setOrderType] = useState<OrderType>(null)

  const handleOrderTypeSelection = (type: OrderType) => {
    setOrderType(type)
  }

  const handleBackToSelection = () => {
    setOrderType(null)
  }

  return (
    <div className="min-h-screen bg-yellow-400">
      <div className="container mx-auto max-w-[800px] px-4">
        <div className="pt-8">

          <AnimatePresence mode="wait">
            {orderType === null && (
              <motion.div
                key="order-type"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OrderTypeSelection onNextStep={handleOrderTypeSelection} />
              </motion.div>
            )}

            {orderType === "individual" && (
              <motion.div
                key="individual-flow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <IndividualOrderFlow onBackToSelection={handleBackToSelection} />
              </motion.div>
            )}

            {orderType === "bulk" && (
              <motion.div
                key="bulk-flow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BulkOrderFlow onBackToSelection={handleBackToSelection} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

