"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddressForm } from "@/components/ordering/shared/AddressForm"
import { validateSingaporeAddress } from "@/utils/addressValidation"

import type { AddressFormData } from "@/components/ordering/shared/AddressForm"

type IndividualSendToProps = {
  onPrevStep: () => void
  onNextStep: () => void
  formData: AddressFormData
  updateFormData: (data: AddressFormData) => void
}

export function IndividualSendTo({ onPrevStep, onNextStep, formData, updateFormData }: IndividualSendToProps) {
  const [isFormValid, setIsFormValid] = useState(false)

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
    <div className="w-full px-4 sm:px-6 md:px-0 md:flex md:justify-center">
  <div className="w-full md:max-w-[1000px]">
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Recipient Details</CardTitle>
        <Badge variant="outline" className="bg-yellow-100 text-black border-black mt-2">
          Individual Order
        </Badge>
      </CardHeader>
      <CardContent className="p-6">
        <AddressForm
          initialData={formData}
          onDataChange={updateFormData}
          onValidityChange={handleFormValidityChange}
          title="Recipient Information"
          showMemo={true}
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
   
  </div>
</div>
  )
}

