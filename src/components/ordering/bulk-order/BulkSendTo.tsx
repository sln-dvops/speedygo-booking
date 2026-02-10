"use client"

import { useRef, useEffect } from "react"
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
  // Use a ref to store the initial component type to prevent switching during edits
  const componentTypeRef = useRef<"csv" | "manual">(null)

  // Determine the component type only once on initial render
  useEffect(() => {
    if (componentTypeRef.current === null) {
      // Only set this once
      const isCsvUpload =
        props.recipients.length > 0 && props.recipients.every((r) => r.name && r.contactNumber && r.email)

      componentTypeRef.current = isCsvUpload ? "csv" : "manual"
    }
  }, [props.recipients])

  // If component type hasn't been determined yet, default to manual
  if (componentTypeRef.current === null) {
    const isCsvUpload =
      props.recipients.length > 0 && props.recipients.every((r) => r.name && r.contactNumber && r.email)

    componentTypeRef.current = isCsvUpload ? "csv" : "manual"
  }

  // Render the appropriate component based on the stored type
  if (componentTypeRef.current === "csv") {
    return <BulkSendToCsv {...props} />
  } else {
    return <BulkSendToManual {...props} />
  }
}

