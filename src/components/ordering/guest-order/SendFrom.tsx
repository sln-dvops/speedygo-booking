"use client"

import type React from "react"
import { AddressForm, type AddressFormData } from "./AddressForm"
import type { PartialOrderDetails } from "@/types/order"

type SendFromProps = {
  onPrevStep: () => void
  onNextStep: () => void
  setOrderDetails: React.Dispatch<React.SetStateAction<PartialOrderDetails>>
}

export function SendFrom({ onPrevStep, onNextStep, setOrderDetails }: SendFromProps) {
  const handleNextStep = (data: AddressFormData) => {
    const senderAddress = `${data.street}, ${data.unitNo}, ${data.postalCode}`
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      senderName: data.name,
      senderAddress,
      senderContactNumber: data.contactNumber,
      senderEmail: data.email,
    }))
    onNextStep()
  }

  return (
    <AddressForm
      title="Send from"
      nameLabel="Name of sender"
      namePlaceholder="Name of sender"
      onPrevStep={onPrevStep}
      onNextStep={handleNextStep}
    />
  )
}

