"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog"
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
import type { AddressFormData } from "@/components/ordering/guest-order/AddressForm"

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
    // Check if there are any unsaved changes
    const hasUnsavedChanges =
      selectedParcelSize !== null ||
      selectedCollectionMethod !== null ||
      Object.values(senderFormData).some((value) => value !== "") ||
      Object.values(recipientFormData).some((value) => value !== "") ||
      Object.values(orderDetails).some((value) => value !== "" && value !== null)

    setUnsavedChanges(hasUnsavedChanges)
  }, [selectedParcelSize, selectedCollectionMethod, senderFormData, recipientFormData, orderDetails, setUnsavedChanges])

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
    }))
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

