"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog"
import { ParcelDimensions } from "@/components/ordering/guest-order/ParcelSize"
import { DeliveryMethod } from "@/components/ordering/guest-order/DeliveryMethod"
import { SendFrom } from "@/components/ordering/guest-order/SendFrom"
import { SendTo } from "@/components/ordering/guest-order/SendTo"
import { Payment } from "@/components/ordering/guest-order/Payment"

import type { ParcelDimensions as ParcelDimensionsType, DeliveryMethod as DeliveryMethodType } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails } from "@/types/order"
import type { AddressFormData } from "@/components/ordering/guest-order/AddressForm"

type Step = 1 | 2 | 3 | 4 | 5

export function OrderFlow() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedDimensions, setSelectedDimensions] = useState<ParcelDimensionsType[] | null>(null)
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
    recipientLine1: "",
    recipientLine2: "",
    recipientPostalCode: "",
    parcelSize: "",
    deliveryMethod: undefined,
    isBulkOrder: false,
  })
  const [senderFormData, setSenderFormData] = useState<AddressFormData>({
    name: "",
    contactNumber: "",
    email: "",
    street: "",
    unitNo: "",
    postalCode: "",
  })
  const [recipientFormData, setRecipientFormData] = useState<AddressFormData>({
    name: "",
    contactNumber: "",
    email: "",
    street: "",
    unitNo: "",
    postalCode: "",
  })
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethodType | undefined>(undefined)

  const { setUnsavedChanges, isDialogOpen, handleConfirmNavigation, handleCancelNavigation } = useUnsavedChanges()

  useEffect(() => {
    const hasUnsavedChanges =
      currentStep <= 5 &&
      (selectedDimensions !== null ||
        Object.values(senderFormData).some((value) => value !== "") ||
        Object.values(recipientFormData).some((value) => value !== "") ||
        Object.values(orderDetails).some((value) => value !== "" && value !== null) ||
        selectedDeliveryMethod !== undefined)

    setUnsavedChanges(hasUnsavedChanges)
  }, [
    currentStep,
    selectedDimensions,
    senderFormData,
    recipientFormData,
    orderDetails,
    setUnsavedChanges,
    selectedDeliveryMethod,
  ])

  // Update isBulkOrder whenever selectedDimensions changes
  useEffect(() => {
    if (selectedDimensions && selectedDimensions.length > 1) {
      setOrderDetails((prev) => ({
        ...prev,
        isBulkOrder: true,
      }))
    } else {
      setOrderDetails((prev) => ({
        ...prev,
        isBulkOrder: false,
      }))
    }
  }, [selectedDimensions])

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prevStep) => (prevStep + 1) as Step)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => (prevStep - 1) as Step)
    }
  }

  const updateSenderFormData = (data: AddressFormData) => {
    setSenderFormData(data)
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      senderName: data.name,
      senderAddress: `${data.street}, ${data.unitNo}, ${data.postalCode}`,
      senderContactNumber: data.contactNumber,
      senderEmail: data.email,
    }))
  }

  const updateRecipientFormData = (data: AddressFormData) => {
    setRecipientFormData(data)
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      recipientName: data.name,
      recipientAddress: `${data.street}, ${data.unitNo}, ${data.postalCode}, Singapore`,
      recipientContactNumber: data.contactNumber,
      recipientEmail: data.email,
      recipientLine1: data.street,
      recipientLine2: data.unitNo,
      recipientPostalCode: data.postalCode,
    }))
  }

  const clearUnsavedChanges = () => {
    setUnsavedChanges(false)
  }

  return (
    <>
      <div className="min-h-screen bg-yellow-400">
        <div className="container mx-auto max-w-[800px] px-4">
          <div className="pt-8">
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
                  <ParcelDimensions
                    onNextStep={handleNextStep}
                    selectedDimensions={selectedDimensions}
                    setSelectedDimensions={setSelectedDimensions}
                  />
                </motion.div>
              )}

              {currentStep === 2 && selectedDimensions && selectedDimensions.length > 0 && (
                <motion.div
                  key="delivery-method"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DeliveryMethod
                    onPrevStep={handlePrevStep}
                    onNextStep={handleNextStep}
                    selectedDimensions={selectedDimensions[0]} // Pass the first parcel for pricing calculation
                    isBulkOrder={selectedDimensions.length > 1}
                    totalParcels={selectedDimensions.length}
                    totalWeight={selectedDimensions.reduce((sum, parcel) => sum + parcel.weight, 0)}
                    selectedDeliveryMethod={selectedDeliveryMethod}
                    setSelectedDeliveryMethod={setSelectedDeliveryMethod}
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
                    formData={senderFormData}
                    updateFormData={updateSenderFormData}
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
                  <SendTo
                    onPrevStep={handlePrevStep}
                    onNextStep={handleNextStep}
                    formData={recipientFormData}
                    updateFormData={updateRecipientFormData}
                  />
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
                    selectedDimensions={selectedDimensions}
                    selectedDeliveryMethod={selectedDeliveryMethod}
                    clearUnsavedChanges={clearUnsavedChanges}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <UnsavedChangesDialog
        isOpen={isDialogOpen}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
      />
    </>
  )
}

