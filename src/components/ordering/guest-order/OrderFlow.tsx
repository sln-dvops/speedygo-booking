"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { OrderTypeSelection } from "@/components/ordering/guest-order/OrderTypeSelection"
import { ParcelDimensions } from "@/components/ordering/guest-order/ParcelSize"
import { DeliveryMethod } from "@/components/ordering/guest-order/DeliveryMethod"
import { SendFrom } from "@/components/ordering/guest-order/SendFrom"
import { SendTo } from "@/components/ordering/guest-order/SendTo"
import { Payment } from "@/components/ordering/guest-order/Payment"

import type { ParcelDimensions as ParcelDimensionsType, DeliveryMethod as DeliveryMethodType } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails, RecipientDetails } from "@/types/order"
import type { AddressFormData } from "@/components/ordering/guest-order/AddressForm"

interface ExtendedAddressFormData extends AddressFormData {
  recipients?: RecipientDetails[]
}

type OrderType = "individual" | "bulk"
type Step = 0 | 1 | 2 | 3 | 4 | 5

export function OrderFlow() {
  const [orderType, setOrderType] = useState<OrderType | null>(null)
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

  useEffect(() => {
    if (orderType) {
      setOrderDetails((prev) => ({
        ...prev,
        isBulkOrder: orderType === "bulk",
      }))
    }
  }, [orderType])

  const handleOrderTypeSelection = (type: OrderType) => {
    setOrderType(type)
    setCurrentStep(1)
  }

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prevStep) => (prevStep + 1) as Step)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
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

  const updateRecipientFormData = (data: ExtendedAddressFormData) => {
    setRecipientFormData(data)

    if (data.recipients && data.recipients.length > 0) {
      setRecipients(data.recipients)
      setOrderDetails((prevDetails) => ({
        ...prevDetails,
        recipients: data.recipients,
      }))
    } else {
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
      <div className="min-h-screen bg-yellow-400">
        <div className="container mx-auto max-w-[800px] px-4">
          <div className="pt-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-black mb-8">
              Speedy Xpress: Create a delivery order
            </h1>

            <AnimatePresence mode="wait">
              {currentStep === 0 && (
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

              {currentStep === 1 && orderType && (
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
                    setRecipients={setRecipients}
                    isBulkOrder={orderType === "bulk"}
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
                    selectedDimensions={selectedDimensions}
                    isBulkOrder={orderType === "bulk"}
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
                    isBulkOrder={orderType === "bulk"}
                    parcels={selectedDimensions}
                    recipients={recipients}
                    updateRecipients={updateRecipients}
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
                    clearUnsavedChanges={() => {}}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}

