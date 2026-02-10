"use client"

import { useEffect } from "react"
import { BulkSendToBase } from "@/components/ordering/shared/BulkSendToBase"
import type { ParcelDimensions } from "@/types/pricing"
import type { RecipientDetails } from "@/types/order"
import type { AddressFormData as BaseAddressFormData } from "@/components/ordering/shared/AddressForm"

interface ExtendedAddressFormData extends BaseAddressFormData {
  recipients?: RecipientDetails[]
}

type BulkSendToManualProps = {
  onPrevStep: () => void
  onNextStep: () => void
  formData: ExtendedAddressFormData
  updateFormData: (data: ExtendedAddressFormData) => void
  parcels?: ParcelDimensions[] | null
  recipients: RecipientDetails[]
  updateRecipients: (recipients: RecipientDetails[]) => void
}

export function BulkSendToManual({
  onPrevStep,
  onNextStep,
  formData,
  updateFormData,
  parcels = null,
  recipients,
  updateRecipients,
}: BulkSendToManualProps) {
  // Initialize recipients if they don't exist yet
  useEffect(() => {
    if (parcels && (!recipients || recipients.length === 0)) {
      const initialRecipients = parcels.map((_, index) => ({
        name: "",
        contactNumber: "",
        email: "",
        address: "",
        line1: "",
        line2: "",
        postalCode: "",
        parcelIndex: index,
      }))
      updateRecipients(initialRecipients)
    }
  }, [parcels, recipients, updateRecipients])

  // Create a stable updateFormData function that won't cause component switching
  const handleUpdateFormData = (data: ExtendedAddressFormData) => {
    // Preserve the original component type to prevent switching
    const updatedData = {
      ...data,
      // Add a flag to identify this as coming from the manual component
      _componentType: "manual",
    }
    updateFormData(updatedData)
  }

  return (
    <BulkSendToBase
      onPrevStep={onPrevStep}
      onNextStep={onNextStep}
      formData={{ ...formData, _componentType: "manual" }}
      updateFormData={handleUpdateFormData}
      parcels={parcels}
      recipients={recipients}
      updateRecipients={updateRecipients}
      title="Recipient Details"
      description="Please enter the delivery details for each parcel. Use the tabs below to navigate between parcels."
    />
  )
}

