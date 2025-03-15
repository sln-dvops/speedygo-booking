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
  return (
    <BulkSendToBase
      onPrevStep={onPrevStep}
      onNextStep={onNextStep}
      formData={formData}
      updateFormData={updateFormData}
      parcels={parcels}
      recipients={recipients}
      updateRecipients={updateRecipients}
      title="Recipient Details"
      description="Please review or update the delivery details for each parcel. Use the tabs below to navigate between parcels."
    />
  )
}

