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
      <div className="container mx-auto px-4 py-8 md:py-8 pt-24 md:pt-8">
        {/* Added pt-24 for mobile to make space for the horizontal progress bar */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0 hidden md:block">
            {/* Hide this container on mobile since we now have the horizontal bar */}
            <div className="lg:sticky lg:top-8">
              <ProgressBar steps={steps} currentStep={currentStep} />
            </div>
          </div>
          <div className="flex-grow">
            {/* Show ProgressBar for all screen sizes - the component handles responsive display */}
            <div className="md:hidden">
              <ProgressBar steps={steps} currentStep={currentStep} />
            </div>
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
        </div>
      </div>
    </div>
  )
}

