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

import type { ParcelSize as ParcelSizeType, CollectionMethod as CollectionMethodType } from "@/types/pricing"

type Step = 1 | 2 | 3 | 4 | 5 | 6

export function OrderFlow() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedParcelSize, setSelectedParcelSize] = useState<ParcelSizeType | null>(null)
  const [selectedCollectionMethod, setSelectedCollectionMethod] = useState<CollectionMethodType | null>(null)

  const steps = [
    { id: 1, name: "Parcel Size" },
    { id: 2, name: "Collection Method" },
    { id: 3, name: "Send from" },
    { id: 4, name: "Send to" },
    { id: 5, name: "Payment" },
    { id: 6, name: "Completed" },
  ]

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((prevStep) => (prevStep + 1) as Step)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => (prevStep - 1) as Step)
    }
  }

  return (
    <div className="min-h-screen bg-yellow-400">
      <div className="container mx-auto">
        <div className="relative flex flex-col md:flex-row">
          {/* Progress bar container */}
          <div className="hidden md:block w-[300px] absolute left-8">
            <div className="fixed pt-[7.5rem]">
              <ProgressBar steps={steps} currentStep={currentStep} />
            </div>
          </div>

          {/* Main content area */}
          <main className="flex-1 px-4 md:pl-[calc(300px+2rem)] md:pr-8">
            {/* Mobile progress bar */}
            <div className="md:hidden fixed top-4 left-0 right-0 px-4 z-[5]">
              <ProgressBar steps={steps} currentStep={currentStep} />
            </div>

            {/* Content with padding for mobile progress bar */}
            <div className="pt-24 md:pt-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-black mb-8">
                Speedy Xpress: Create a delivery order
              </h1>

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
                    <SendFrom onPrevStep={handlePrevStep} onNextStep={handleNextStep} />
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
                    <SendTo onPrevStep={handlePrevStep} onNextStep={handleNextStep} />
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
                      onNextStep={handleNextStep}
                      selectedParcelSize={selectedParcelSize}
                      selectedCollectionMethod={selectedCollectionMethod}
                    />
                  </motion.div>
                )}

                {currentStep === 6 && (
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

