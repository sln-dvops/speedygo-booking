"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog"
import { ProgressBar } from "@/components/ordering/guest-order/ProgressBar"
import { ParcelDimensions } from "@/components/ordering/guest-order/ParcelSize"
import { DeliveryMethod } from "@/components/ordering/guest-order/DeliveryMethod"
import { SendFrom } from "@/components/ordering/guest-order/SendFrom"
import { SendTo } from "@/components/ordering/guest-order/SendTo"
import { Payment } from "@/components/ordering/guest-order/Payment"
import { Completed } from "@/components/ordering/guest-order/Completed"
import { Waybill } from "@/components/ordering/guest-order/Waybill"

import type { ParcelDimensions as ParcelDimensionsType, DeliveryMethod as DeliveryMethodType } from "@/types/pricing"
import type { OrderDetails, PartialOrderDetails } from "@/types/order"
import type { AddressFormData } from "@/components/ordering/guest-order/AddressForm"

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

export function OrderFlow() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedDimensions, setSelectedDimensions] = useState<ParcelDimensionsType | null>(null)
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
    deliveryMethod: null,
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
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethodType | null>(null)

  const searchParams = useSearchParams()
  const { setUnsavedChanges, isDialogOpen, handleConfirmNavigation, handleCancelNavigation } = useUnsavedChanges()

  useEffect(() => {
    const orderId = searchParams.get("order")
    const paymentReference = searchParams.get("reference")

    if (orderId && paymentReference) {
      fetchOrderDetails(orderId)
    }
  }, [searchParams])

  useEffect(() => {
    // Check if there are any unsaved changes only for steps 1 to 5
    const hasUnsavedChanges =
      currentStep <= 5 &&
      (selectedDimensions !== null ||
        Object.values(senderFormData).some((value) => value !== "") ||
        Object.values(recipientFormData).some((value) => value !== "") ||
        Object.values(orderDetails).some((value) => value !== "" && value !== null) ||
        selectedDeliveryMethod !== null)

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

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/payment/success?order=${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrderDetails(data.orderDetails)
        setCurrentStep(6) // Show waybill step
      } else {
        console.error("Failed to fetch order details")
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    }
  }

  const steps = [
    { id: 1, name: "Parcel Size" },
    { id: 2, name: "Delivery Method" },
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
        <div className="container mx-auto max-w-[1200px] px-4">
          <div className="relative flex flex-col md:flex-row">
            <div className="hidden lg:block w-0 flex-shrink-0">
              <ProgressBar steps={steps} currentStep={currentStep} />
            </div>

            <main className="flex-1 mx-auto max-w-[800px] w-full">
              <div className="pt-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-black mb-8">
                  Speedy Xpress: Create a delivery order
                </h1>

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
                      <ParcelDimensions
                        onNextStep={handleNextStep}
                        selectedDimensions={selectedDimensions}
                        setSelectedDimensions={setSelectedDimensions}
                      />
                    </motion.div>
                  )}

                  {currentStep === 2 && selectedDimensions && (
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
                        selectedDimensions={selectedDimensions as ParcelDimensionsType}
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
                          deliveryMethod={orderDetails.deliveryMethod || null}
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
                            onClick={() => setCurrentStep(7)}
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
      <UnsavedChangesDialog
        isOpen={isDialogOpen}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
      />
    </>
  )
}

