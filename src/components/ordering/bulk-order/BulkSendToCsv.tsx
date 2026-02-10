"use client"
import { BulkSendToBase } from "@/components/ordering/shared/BulkSendToBase"
import type { ParcelDimensions } from "@/types/pricing"
import type { RecipientDetails } from "@/types/order"
import type { AddressFormData as BaseAddressFormData } from "@/components/ordering/shared/AddressForm"

interface ExtendedAddressFormData extends BaseAddressFormData {
  recipients?: RecipientDetails[]
}

type BulkSendToCsvProps = {
  onPrevStep: () => void
  onNextStep: () => void
  formData: ExtendedAddressFormData
  updateFormData: (data: ExtendedAddressFormData) => void
  parcels?: ParcelDimensions[] | null
  recipients: RecipientDetails[]
  updateRecipients: (recipients: RecipientDetails[]) => void
}

export function BulkSendToCsv({
  onPrevStep,
  onNextStep,
  formData,
  updateFormData,
  parcels = null,
  recipients,
  updateRecipients,
}: BulkSendToCsvProps) {
  // Create a stable updateFormData function that won't cause component switching
  const handleUpdateFormData = (data: ExtendedAddressFormData) => {
    // Preserve the original component type to prevent switching
    const updatedData = {
      ...data,
      // Add a flag to identify this as coming from the CSV component
      _componentType: "csv",
    }
    updateFormData(updatedData)
  }

  return (
    <BulkSendToBase
      onPrevStep={onPrevStep}
      onNextStep={onNextStep}
      formData={{ ...formData, _componentType: "csv" }}
      updateFormData={handleUpdateFormData}
      parcels={parcels}
      recipients={recipients}
      updateRecipients={updateRecipients}
      title="Recipient Details"
      description="Please review or update the delivery details for each parcel. Use the tabs below to navigate between parcels."
    />
  )
}

