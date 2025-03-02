"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProgressBar } from "@/components/ordering/guest-order/ProgressBar"
import { ParcelSize } from "@/components/ordering/guest-order/ParcelSize"
import { CollectionMethod } from "@/components/ordering/guest-order/CollectionMethod"
import { SendFrom } from "@/components/ordering/guest-order/SendFrom"
import { SendTo } from "@/components/ordering/guest-order/SendTo"
import { Payment } from "@/components/ordering/guest-order/Payment"
import { Completed } from "@/components/ordering/guest-order/Completed"
import { Waybill } from "@/components/ordering/guest-order/Waybill"

import type { ParcelSize as ParcelSizeType, CollectionMethod as CollectionMethodType } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails } from "@/types/order"

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

export function OrderFlow() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedParcelSize, setSelectedParcelSize] = useState<ParcelSizeType | null>(null)
  const [selectedCollectionMethod, setSelectedCollectionMethod] = useState<CollectionMethodType | null>(null)
  const [orderDetails, setOrderDetails] = useState<PartialOrderDetails>({
    orderNumber: "",
    senderName: "",
    senderAddress: "",
    senderContactNumber: "",
    senderEmail: "",
    recipientName: "",
    recipientAddress: "",
    recipientContactNumber: "",
    recipientEmail: "",
    parcelSize: null,
    collectionMethod: null,
  })

  const steps = [
    { id: 1, name: "Parcel Size" },
    { id: 2, name: "Collection Method" },
    { id: 3, name: "Send from" },
    { id: 4, name: "Send to" },
    { id: 5, name: "Payment" },
    { id: 6, name: "Waybill" },
    { id: 7, name: "Completed" },
  ]

  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep((prevStep) => (prevStep + 1) as Step)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => (prevStep - 1) as Step)
    }
  }

  const handlePrintWaybill = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-yellow-400">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="relative flex flex-col md:flex-row">
          {/* Progress bar container - desktop only */}
          <div className="hidden lg:block w-0 flex-shrink-0">
            <ProgressBar steps={steps} currentStep={currentStep} />
          </div>

          {/* Main content area - centered in page */}
          <main className="flex-1 mx-auto max-w-[800px] w-full">
            <div className="pt-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-black mb-8">
                Speedy Xpress: Create a delivery order
              </h1>

              {/* Mobile progress bar */}
              <div className="block lg:hidden mb-6">
                <ProgressBar steps={steps} currentStep={currentStep} />
              </div>

              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="parcel-size"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ParcelSize
                      onNextStep={handleNextStep}
                      selectedParcelSize={selectedParcelSize}
                      setSelectedParcelSize={setSelectedParcelSize}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && selectedParcelSize && (
                  <motion.div
                    key="collection-method"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CollectionMethod
                      onPrevStep={handlePrevStep}
                      onNextStep={handleNextStep}
                      selectedParcelSize={selectedParcelSize}
                      selectedCollectionMethod={selectedCollectionMethod}
                      setSelectedCollectionMethod={setSelectedCollectionMethod}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="send-from"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SendFrom
                      onPrevStep={handlePrevStep}
                      onNextStep={handleNextStep}
                      setOrderDetails={setOrderDetails}
                    />
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="send-to"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SendTo onPrevStep={handlePrevStep} onNextStep={handleNextStep} setOrderDetails={setOrderDetails} />
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Payment
                      onPrevStep={handlePrevStep}
                      orderDetails={orderDetails as OrderDetails}
                      setOrderDetails={setOrderDetails}
                      selectedParcelSize={selectedParcelSize}
                      selectedCollectionMethod={selectedCollectionMethod}
                    />
                  </motion.div>
                )}

                {currentStep === 6 && (
                  <motion.div
                    key="waybill"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <h2 className="text-2xl font-bold mb-4">Your Waybill</h2>
                      <p className="mb-4">Please print this waybill and attach it to your parcel.</p>
                      <Waybill
                        orderNumber={orderDetails.orderNumber || ""}
                        senderName={orderDetails.senderName || ""}
                        senderAddress={orderDetails.senderAddress || ""}
                        recipientName={orderDetails.recipientName || ""}
                        recipientAddress={orderDetails.recipientAddress || ""}
                        parcelSize={orderDetails.parcelSize || ""}
                        collectionMethod={orderDetails.collectionMethod || ""}
                        qrCode=""
                      />
                      <div className="mt-6 flex justify-between">
                        <button
                          onClick={handlePrintWaybill}
                          className="bg-black text-yellow-400 px-6 py-2 rounded-md hover:bg-black/90"
                        >
                          Print Waybill
                        </button>
                        <button
                          onClick={handleNextStep}
                          className="bg-black text-yellow-400 px-6 py-2 rounded-md hover:bg-black/90"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 7 && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Completed />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

