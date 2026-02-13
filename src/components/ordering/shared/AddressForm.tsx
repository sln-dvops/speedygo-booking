"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { validateSingaporeAddress, type ValidationResult } from "@/utils/addressValidation"
import { AddressAutocompleteInput } from "./AddressAutoCompleteInput"


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
  <div className="address-form">
    {/* Name + Phone */}
    <div className="address-grid two">
      <div className="field">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className={validationResult.errors.name ? "error" : ""}
        />
        <span>Name</span>
        {validationResult.errors.name && (
          <p className="error-text">{validationResult.errors.name}</p>
        )}
      </div>

      <div className="field">
        <input
          type="text"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          placeholder="Phone number"
          className={validationResult.errors.contactNumber ? "error" : ""}
        />
        <span>Phone number</span>
        {validationResult.errors.contactNumber && (
          <p className="error-text">{validationResult.errors.contactNumber}</p>
        )}
      </div>
    </div>

    {/* Email (FULL WIDTH) */}
    <div className="address-grid one">
      <div className="field">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className={validationResult.errors.email ? "error" : ""}
        />
        <span>Email</span>
        {validationResult.errors.email && (
          <p className="error-text">{validationResult.errors.email}</p>
        )}
      </div>
    </div>

    {/* Address (FULL WIDTH) */}
    <div className="address-grid one">
      <div className="field">
        <AddressAutocompleteInput
          value={formData.street}
          inputClassName={`${
            validationResult.errors.street ? "error" : ""
          }`}
          placeholder="Address"
          onChange={(val) => {
            const updated = { ...formData, street: val }
            setFormData(updated)
            onDataChange(updated)
          }}
          onSelect={(s) => {
            const updated = {
              ...formData,
              street: s.address,
              postalCode: s.postalCode,
            }

            setFormData(updated)
            onDataChange(updated)

            const result = validateSingaporeAddress(updated)
            setValidationResult(result)
            onValidityChange(result.isValid)
          }}
        />
        {validationResult.errors.street && (
          <p className="error-text">{validationResult.errors.street}</p>
        )}
      </div>
    </div>

    {/* Unit + Postal */}
    <div className="address-grid two">
      <div className="field">
        <input
          type="text"
          name="unitNo"
          value={formData.unitNo}
          onChange={handleChange}
          placeholder="Unit"
          className={validationResult.errors.unitNo ? "error" : ""}
        />
        <span>Unit</span>
        {validationResult.errors.unitNo && (
          <p className="error-text">{validationResult.errors.unitNo}</p>
        )}
      </div>

      <div className="field">
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          placeholder="Postal code"
          className={validationResult.errors.postalCode ? "error" : ""}
        />
        <span>Postal code</span>
        {validationResult.errors.postalCode && (
          <p className="error-text">{validationResult.errors.postalCode}</p>
        )}
      </div>
    </div>
  </div>
)

}

