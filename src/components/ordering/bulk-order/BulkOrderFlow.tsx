"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ParcelDimensions } from "@/components/ordering/bulk-order/BulkParcelSize"
import { DeliveryMethod } from "@/components/ordering/shared/DeliveryMethod"
import { SendFrom } from "@/components/ordering/shared/SendFrom"
import { BulkSendTo } from "@/components/ordering/bulk-order/BulkSendTo"
import { Payment } from "@/components/ordering/shared/Payment"

import type { ParcelDimensions as ParcelDimensionsType, DeliveryMethod as DeliveryMethodType } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails, RecipientDetails } from "@/types/order"
import type { AddressFormData } from "@/components/ordering/shared/AddressForm"

interface ExtendedAddressFormData extends AddressFormData {
  recipients?: RecipientDetails[]
}

type Step = 0 | 1 | 2 | 3 | 4

export function BulkOrderFlow({ onBackToSelection }: { onBackToSelection: () => void }) {
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
    isBulkOrder: true,
    recipients: [],
  })
  const [senderFormData, setSenderFormData] = useState<AddressFormData>({
    name: "",
    contactNumber: "",
    email: "",
    street: "",
    unitNo: "",
    postalCode: "",
  })
  const [recipientFormData, setRecipientFormData] = useState<ExtendedAddressFormData>({
    name: "",
    contactNumber: "",
    email: "",
    street: "",
    unitNo: "",
    postalCode: "",
    recipients: [],
  })
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethodType | undefined>(undefined)
  const [recipients, setRecipients] = useState<RecipientDetails[]>([])

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

  const updateRecipientFormData = (data: ExtendedAddressFormData) => {
    setRecipientFormData(data)

    if (data.recipients && data.recipients.length > 0) {
      setRecipients(data.recipients)
      setOrderDetails((prevDetails) => ({
        ...prevDetails,
        recipients: data.recipients,
      }))
    }
  }

  const updateRecipients = (newRecipients: RecipientDetails[]) => {
    setRecipients(newRecipients)
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      recipients: newRecipients,
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
              setRecipients={setRecipients}
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
              isBulkOrder={true}
              totalParcels={selectedDimensions.length}
              totalWeight={selectedDimensions.reduce((sum, parcel) => sum + parcel.weight, 0)}
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
            <BulkSendTo
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              formData={recipientFormData}
              updateFormData={updateRecipientFormData}
              parcels={selectedDimensions}
              recipients={recipients}
              updateRecipients={updateRecipients}
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

