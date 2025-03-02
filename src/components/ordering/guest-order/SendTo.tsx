"use client"

import type React from "react"
import { AddressForm, type AddressFormData } from "./AddressForm"
import type { PartialOrderDetails } from "@/types/order"

type SendToProps = {
  onPrevStep: () => void
  onNextStep: () => void
  setOrderDetails: React.Dispatch<React.SetStateAction<PartialOrderDetails>>
}

export function SendTo({ onPrevStep, onNextStep, setOrderDetails }: SendToProps) {
  const handleNextStep = (data: AddressFormData) => {
    const recipientAddress = `${data.street}, ${data.unitNo}, ${data.postalCode}, Singapore`
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      recipientName: data.name,
      recipientAddress,
      recipientContactNumber: data.contactNumber,
      recipientEmail: data.email,
    }))
    onNextStep()
  }

  return (
    <AddressForm
      title="Send to"
      nameLabel="Name of recipient"
      namePlaceholder="Name of recipient"
      onPrevStep={onPrevStep}
      onNextStep={handleNextStep}
    />
  )
}

