"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { validateSingaporeAddress, type ValidationResult } from "@/utils/addressValidation"

export interface AddressFormData {
  name: string
  contactNumber: string
  email: string
  street: string
  unitNo: string
  postalCode: string
}

export interface AddressFormProps {
  initialData: AddressFormData
  onDataChange: (data: AddressFormData) => void
  onValidityChange: (isValid: boolean) => void
  title?: string
}

export function AddressForm({
  initialData = {
    name: "",
    contactNumber: "",
    email: "",
    street: "",
    unitNo: "",
    postalCode: "",
  },
  onDataChange,
  onValidityChange,
  title = "Address Information",
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>(initialData)
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: false, errors: {} })
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // This effect will run when initialData changes, but we don't validate on initialization
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      // Don't validate on initialization to avoid showing errors for empty fields
    }
  }, [initialData])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }

    // Always update local state immediately
    setFormData(updatedData)

    // Always notify parent of data change
    onDataChange(updatedData)

    // Clear any existing validation timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }

    // Debounce validation, especially for contact number
    validationTimeoutRef.current = setTimeout(
      () => {
        const result = validateSingaporeAddress(updatedData)
        setValidationResult(result)
        onValidityChange(result.isValid)
      },
      name === "contactNumber" ? 300 : 100,
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 font-medium">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`border ${validationResult.errors.name ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
          />
          {validationResult.errors.name && <p className="text-red-500 text-sm mt-1">{validationResult.errors.name}</p>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="contactNumber" className="mb-1 font-medium">
            Contact Number:
          </label>
          <input
            type="text"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className={`border ${validationResult.errors.contactNumber ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
            placeholder="8XXXXXXX"
          />
          {validationResult.errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1">{validationResult.errors.contactNumber}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <label htmlFor="email" className="mb-1 font-medium">
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`border ${validationResult.errors.email ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
        />
        {validationResult.errors.email && <p className="text-red-500 text-sm mt-1">{validationResult.errors.email}</p>}
      </div>

      <div className="flex flex-col">
        <label htmlFor="street" className="mb-1 font-medium">
          Street Address:
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          className={`border ${validationResult.errors.street ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
        />
        {validationResult.errors.street && (
          <p className="text-red-500 text-sm mt-1">{validationResult.errors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label htmlFor="unitNo" className="mb-1 font-medium">
            Unit Number:
          </label>
          <input
            type="text"
            id="unitNo"
            name="unitNo"
            value={formData.unitNo}
            onChange={handleChange}
            className={`border ${validationResult.errors.unitNo ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
            placeholder="#01-01"
          />
          {validationResult.errors.unitNo && (
            <p className="text-red-500 text-sm mt-1">{validationResult.errors.unitNo}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="postalCode" className="mb-1 font-medium">
            Postal Code:
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={`border ${validationResult.errors.postalCode ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
            placeholder="123456"
          />
          {validationResult.errors.postalCode && (
            <p className="text-red-500 text-sm mt-1">{validationResult.errors.postalCode}</p>
          )}
        </div>
      </div>
    </div>
  )
}

