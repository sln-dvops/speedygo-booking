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

import type { AddressFormData as BaseAddressFormData } from "@/components/ordering/guest-order/AddressForm"

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
  recipients: RecipientDetails[]
  updateRecipients: (recipients: RecipientDetails[]) => void
}

export function SendTo({
  onPrevStep,
  onNextStep,
  formData,
  updateFormData,
  isBulkOrder = false,
  parcels = null,
  recipients,
  updateRecipients,
}: SendToProps) {
  const [isFormValid, setIsFormValid] = useState(false)
  const [recipientAddresses, setRecipientAddresses] = useState<BaseAddressFormData[]>(() => {
    if (isBulkOrder && recipients.length > 0) {
      return recipients.map((recipient: RecipientDetails) => ({
        name: recipient.name,
        contactNumber: recipient.contactNumber,
        email: recipient.email,
        street: recipient.line1,
        unitNo: recipient.line2 || "",
        postalCode: recipient.postalCode,
      }))
    }
    if (!isBulkOrder && formData) {
      return [
        {
          name: formData.name,
          contactNumber: formData.contactNumber,
          email: formData.email,
          street: formData.street,
          unitNo: formData.unitNo,
          postalCode: formData.postalCode,
        },
      ]
    }
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

  useEffect(() => {
    if (!isBulkOrder && formData) {
      const result = validateSingaporeAddress(formData)
      setIsFormValid(result.isValid)
    }
  }, [formData, isBulkOrder])

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

  const handleAddressChange = (index: number, data: BaseAddressFormData) => {
    setRecipientAddresses((prevAddresses) => {
      const newAddresses = [...prevAddresses]
      newAddresses[index] = data
      return newAddresses
    })

    if (isBulkOrder) {
      const updatedRecipients = recipients.map((recipient, idx) => {
        if (idx === index) {
          return {
            ...recipient,
            name: data.name,
            contactNumber: data.contactNumber,
            email: data.email,
            address: `${data.street}, ${data.unitNo}, ${data.postalCode}, Singapore`,
            line1: data.street,
            line2: data.unitNo,
            postalCode: data.postalCode,
          }
        }
        return recipient
      })
      updateRecipients(updatedRecipients)
    } else {
      updateFormData(data)
    }
  }

  const handleValidityChange = (index: number, isValid: boolean) => {
    const tabId = `parcel-${index + 1}`
    setValidTabs((prevTabs) => {
      if (isValid && !prevTabs.includes(tabId)) {
        return [...prevTabs, tabId]
      }
      if (!isValid) {
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
    if (isBulkOrder) {
      updateFormData({
        ...formData,
        recipients: recipients,
      })
    } else {
      updateFormData(recipientAddresses[0])
    }
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
                Please review or update the delivery details for each parcel. Use the tabs below to navigate between
                parcels.
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
                    onDataChange={(data) => handleAddressChange(index, data)}
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
            initialData={recipientAddresses[0]}
            onDataChange={(data) => handleAddressChange(0, data)}
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

