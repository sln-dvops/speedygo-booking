"use client"

import { BulkSendToCsv } from "./BulkSendToCsv"
import { BulkSendToManual } from "./BulkSendToManual"
import type { ParcelDimensions } from "@/types/pricing"
import type { RecipientDetails } from "@/types/order"
import type { AddressFormData } from "@/components/ordering/shared/AddressForm"

interface ExtendedAddressFormData extends AddressFormData {
  recipients?: RecipientDetails[]
}

type BulkSendToProps = {
  onPrevStep: () => void
  onNextStep: () => void
  formData: ExtendedAddressFormData
  updateFormData: (data: ExtendedAddressFormData) => void
  parcels?: ParcelDimensions[] | null
  recipients: RecipientDetails[]
  updateRecipients: (recipients: RecipientDetails[]) => void
}

export function BulkSendTo(props: BulkSendToProps) {
  // Determine if this is a CSV upload or manual entry based on recipients data
  const isCsvUpload = props.recipients.length > 0 && props.recipients.every((r) => r.name && r.contactNumber && r.email)

  if (isCsvUpload) {
    return <BulkSendToCsv {...props} />
  } else {
    return <BulkSendToManual {...props} />
  }
}

