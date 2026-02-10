"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ParcelDimensions } from "@/components/ordering/individual-order/IndividualParcelSize"
import { DeliveryMethod } from "@/components/ordering/shared/DeliveryMethod"
import { SendFrom } from "@/components/ordering/shared/SendFrom"
import { IndividualSendTo } from "@/components/ordering/individual-order/IndividualSendTo"
import { Payment } from "@/components/ordering/shared/Payment"

import type { ParcelDimensions as ParcelDimensionsType, DeliveryMethod as DeliveryMethodType } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails } from "@/types/order"
import type { AddressFormData } from "@/components/ordering/shared/AddressForm"

type Step = 0 | 1 | 2 | 3 | 4

export function IndividualOrderFlow({ onBackToSelection }: { onBackToSelection: () => void }) {
  const [currentStep, setCurrentStep] = useState<Step>(0)
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

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prevStep) => (prevStep + 1) as Step)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => (prevStep - 1) as Step)
    } else {
      onBackToSelection()
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

  return (
    <>
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="parcel-size"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ParcelDimensions
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              selectedDimensions={selectedDimensions}
              setSelectedDimensions={setSelectedDimensions}
            />
          </motion.div>
        )}

        {currentStep === 1 && selectedDimensions && selectedDimensions.length > 0 && (
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
              selectedDimensions={selectedDimensions}
              isBulkOrder={false}
              totalParcels={1}
              totalWeight={selectedDimensions[0].weight}
              selectedDeliveryMethod={selectedDeliveryMethod}
              setSelectedDeliveryMethod={setSelectedDeliveryMethod}
            />
          </motion.div>
        )}

        {currentStep === 2 && (
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

        {currentStep === 3 && (
          <motion.div
            key="send-to"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <IndividualSendTo
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              formData={recipientFormData}
              updateFormData={updateRecipientFormData}
            />
          </motion.div>
        )}

        {currentStep === 4 && (
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
              clearUnsavedChanges={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

