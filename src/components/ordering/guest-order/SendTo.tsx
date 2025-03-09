"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddressForm } from "@/components/ordering/guest-order/AddressForm"
import { validateSingaporeAddress } from "@/utils/addressValidation"
import type { ParcelDimensions } from "@/types/pricing"
import type { RecipientDetails } from "@/types/order"

// Import the AddressFormData type but extend it for our local use
import type { AddressFormData as BaseAddressFormData } from "@/components/ordering/guest-order/AddressForm"

// Create an extended type that includes recipients
interface ExtendedAddressFormData extends BaseAddressFormData {
  recipients?: RecipientDetails[]
}

type SendToProps = {
  onPrevStep: () => void
  onNextStep: () => void
  formData: ExtendedAddressFormData
  updateFormData: (data: ExtendedAddressFormData) => void
  isBulkOrder?: boolean
  parcels?: ParcelDimensions[] | null
}

export function SendTo({
  onPrevStep,
  onNextStep,
  formData,
  updateFormData,
  isBulkOrder = false,
  parcels = null,
}: SendToProps) {
  const [isFormValid, setIsFormValid] = useState(false)
  const [recipientAddresses, setRecipientAddresses] = useState<BaseAddressFormData[]>(() => {
    // If we already have recipients data from a previous visit to this step,
    // use that to initialize our form state
    if (isBulkOrder && formData.recipients && formData.recipients.length > 0 && parcels) {
      return formData.recipients.map((recipient: RecipientDetails) => ({
        name: recipient.name,
        contactNumber: recipient.contactNumber,
        email: recipient.email,
        street: recipient.line1,
        unitNo: recipient.line2 || "",
        postalCode: recipient.postalCode,
      }))
    }

    // Otherwise initialize with empty forms for each parcel
    if (parcels) {
      return parcels.map(() => ({
        name: "",
        contactNumber: "",
        email: "",
        street: "",
        unitNo: "",
        postalCode: "",
      }))
    }
    return []
  })
  const [activeTab, setActiveTab] = useState("parcel-1")
  const [validTabs, setValidTabs] = useState<string[]>([])

  // Validate initial form data when component mounts or formData changes
  useEffect(() => {
    if (!isBulkOrder && formData) {
      const result = validateSingaporeAddress(formData)
      setIsFormValid(result.isValid)
    }
  }, [formData, isBulkOrder])

  // Validate initial bulk addresses when component mounts
  useEffect(() => {
    if (isBulkOrder && parcels && recipientAddresses.length > 0) {
      const newValidTabs: string[] = []

      recipientAddresses.forEach((address, index) => {
        const result = validateSingaporeAddress(address)
        if (result.isValid) {
          newValidTabs.push(`parcel-${index + 1}`)
        }
      })

      setValidTabs(newValidTabs)
    }
  }, [isBulkOrder, parcels, recipientAddresses])

  const handleFormValidityChange = (isValid: boolean) => {
    setIsFormValid(isValid)
  }

  const handleBulkAddressChange = (index: number, data: BaseAddressFormData) => {
    // Update the local state first
    setRecipientAddresses((prevAddresses) => {
      const newAddresses = [...prevAddresses]
      newAddresses[index] = data
      return newAddresses
    })

    // Use useEffect to handle parent state updates after render
  }

  // Add this useEffect to handle parent state updates after render
  useEffect(() => {
    if (isBulkOrder && recipientAddresses.length > 0) {
      // Create the recipients array with the updated data
      const updatedRecipients = recipientAddresses.map((address, idx) => ({
        name: address.name,
        contactNumber: address.contactNumber,
        email: address.email,
        address: `${address.street}, ${address.unitNo}, ${address.postalCode}, Singapore`,
        line1: address.street,
        line2: address.unitNo,
        postalCode: address.postalCode,
        parcelIndex: idx,
      }))

      // Update the parent component with all recipient details
      const updatedFormData: ExtendedAddressFormData = {
        ...formData,
        recipients: updatedRecipients,
      }

      // Only update if recipients have actually changed
      if (JSON.stringify(updatedRecipients) !== JSON.stringify(formData.recipients || [])) {
        updateFormData(updatedFormData)
      }
    }
  }, [recipientAddresses, isBulkOrder, formData, updateFormData])

  const handleValidityChange = (index: number, isValid: boolean) => {
    const tabId = `parcel-${index + 1}`
    setValidTabs((prevTabs) => {
      if (isValid) {
        if (!prevTabs.includes(tabId)) {
          return [...prevTabs, tabId]
        }
      } else {
        return prevTabs.filter((id) => id !== tabId)
      }
      return prevTabs
    })
  }

  const handleNextParcel = () => {
    const currentIndex = Number.parseInt(activeTab.split("-")[1]) - 1
    if (currentIndex < (parcels?.length || 0) - 1) {
      setActiveTab(`parcel-${currentIndex + 2}`)
    }
  }

  const handlePrevParcel = () => {
    const currentIndex = Number.parseInt(activeTab.split("-")[1]) - 1
    if (currentIndex > 0) {
      setActiveTab(`parcel-${currentIndex}`)
    }
  }

  const handleNext = () => {
    // We don't need to update recipients here anymore since the useEffect handles it
    onNextStep()
  }

  const allFormsValid = isBulkOrder ? parcels && validTabs.length === parcels.length : isFormValid

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Recipient Details</CardTitle>
        {isBulkOrder && parcels && (
          <Badge variant="outline" className="bg-yellow-200 text-black border-black mt-2">
            Bulk Order ({parcels.length} Parcels)
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {isBulkOrder && parcels ? (
          <div className="space-y-6">
            <div className="bg-yellow-100 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-black mb-2">Multiple Recipients</h3>
              <p className="text-sm text-gray-600">
                Please provide the delivery details for each parcel. Use the tabs below to navigate between parcels.
              </p>
            </div>

            <Tabs defaultValue="parcel-1" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-center w-full mb-6">
                <TabsList className="h-10 items-center bg-gray-100/80 p-1">
                  {parcels.map((_, index) => {
                    const isValid = validTabs.includes(`parcel-${index + 1}`)
                    const isActive = activeTab === `parcel-${index + 1}`

                    return (
                      <TabsTrigger
                        key={`tab-${index}`}
                        value={`parcel-${index + 1}`}
                        className={`
                          min-w-[3rem] h-8 px-3 relative
                          data-[state=active]:bg-white data-[state=active]:text-black
                          ${isValid ? "text-green-600 font-medium" : "text-gray-600"}
                          ${isActive ? "shadow-sm" : ""}
                        `}
                      >
                        <span className="relative">
                          {index + 1}
                          {isValid && <div className="absolute -top-1 -right-2 w-2 h-2 bg-green-500 rounded-full" />}
                        </span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>

              {parcels.map((parcel, index) => (
                <TabsContent key={`content-${index}`} value={`parcel-${index + 1}`}>
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-black mb-2">Parcel {index + 1} Details</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {parcel.weight}kg • {parcel.length}cm × {parcel.width}cm × {parcel.height}cm
                    </p>
                  </div>

                  <AddressForm
                    initialData={recipientAddresses[index]}
                    onDataChange={(data) => handleBulkAddressChange(index, data)}
                    onValidityChange={(isValid: boolean) => handleValidityChange(index, isValid)}
                    title="Recipient Information"
                  />
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={handlePrevParcel}
                disabled={activeTab === "parcel-1"}
                className="border-black text-black hover:bg-yellow-100"
              >
                Previous Parcel
              </Button>

              <Button
                onClick={handleNextParcel}
                disabled={activeTab === `parcel-${parcels.length}`}
                className="bg-black hover:bg-black/90 text-yellow-400"
              >
                Next Parcel
              </Button>
            </div>

            <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-black">Completed:</span>
                <span className="font-medium text-black">
                  {validTabs.length} of {parcels.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${(validTabs.length / parcels.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <AddressForm
            initialData={formData}
            onDataChange={updateFormData}
            onValidityChange={handleFormValidityChange}
            title="Recipient Information"
          />
        )}
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onPrevStep} className="border-black text-black hover:bg-yellow-100">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-black hover:bg-black/90 text-yellow-400" disabled={!allFormsValid}>
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}

