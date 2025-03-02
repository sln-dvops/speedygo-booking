"use client"
import { AddressForm, type AddressFormData } from "./AddressForm"

type SendToProps = {
  onPrevStep: () => void
  onNextStep: () => void
  formData: AddressFormData
  updateFormData: (data: AddressFormData) => void
}

export function SendTo({ onPrevStep, onNextStep, formData, updateFormData }: SendToProps) {
  const handleNextStep = (data: AddressFormData) => {
    updateFormData(data)
    onNextStep()
  }

  return (
    <AddressForm
      title="Send to"
      nameLabel="Name of recipient"
      namePlaceholder="Name of recipient"
      onPrevStep={onPrevStep}
      onNextStep={handleNextStep}
      defaultValues={formData}
    />
  )
}

