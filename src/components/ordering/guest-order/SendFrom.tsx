"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AddressForm, type AddressFormData } from "@/components/ordering/guest-order/AddressForm"
import { validateSingaporeAddress } from "@/utils/addressValidation"

type SendFromProps = {
  onPrevStep: () => void
  onNextStep: () => void
  formData: AddressFormData
  updateFormData: (data: AddressFormData) => void
}

export function SendFrom({ onPrevStep, onNextStep, formData, updateFormData }: SendFromProps) {
  const [isFormValid, setIsFormValid] = useState(false)

  // Validate initial form data when component mounts or formData changes
  useEffect(() => {
    if (formData) {
      const result = validateSingaporeAddress(formData)
      setIsFormValid(result.isValid)
    }
  }, [formData])

  const handleFormValidityChange = (isValid: boolean) => {
    setIsFormValid(isValid)
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Sender Details</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <AddressForm
          initialData={formData}
          onDataChange={updateFormData}
          onValidityChange={handleFormValidityChange}
          title="Sender Information"
        />
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onPrevStep} className="border-black text-black hover:bg-yellow-100">
          Back
        </Button>
        <Button onClick={onNextStep} className="bg-black hover:bg-black/90 text-yellow-400" disabled={!isFormValid}>
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}

