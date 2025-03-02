"use client"
import { AddressForm, type AddressFormData } from "./AddressForm"

type SendFromProps = {
  onPrevStep: () => void
  onNextStep: () => void
  formData: AddressFormData
  updateFormData: (data: AddressFormData) => void
}

export function SendFrom({ onPrevStep, onNextStep, formData, updateFormData }: SendFromProps) {
  const handleNextStep = (data: AddressFormData) => {
    updateFormData(data)
    onNextStep()
  }

  return (
    <AddressForm
      title="Send from"
      nameLabel="Name of sender"
      namePlaceholder="Name of sender"
      onPrevStep={onPrevStep}
      onNextStep={handleNextStep}
      defaultValues={formData}
    />
  )
}

