"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  validateSingaporeAddress,
  type ValidationResult,
} from "@/utils/addressValidation";
import { AddressAutocompleteInput } from "./AddressAutoCompleteInput";

export interface AddressFormData {
  name: string;
  contactNumber: string;
  email: string;
  street: string;
  unitNo: string;
  postalCode: string;
  memo: string;
}

export interface AddressFormProps {
  initialData: AddressFormData;
  onDataChange: (data: AddressFormData) => void;
  onValidityChange: (isValid: boolean) => void;
  title?: string;
  showMemo?: boolean;
}

export function AddressForm({
  initialData = {
    name: "",
    contactNumber: "",
    email: "",
    street: "",
    unitNo: "",
    postalCode: "",
    memo: "",
  },
  onDataChange,
  onValidityChange,
  title = "Address Information",
  showMemo = false,
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>(initialData);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: false,
    errors: {},
  });
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // This effect will run when initialData changes, but we don't validate on initialization
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // Don't validate on initialization to avoid showing errors for empty fields
    }
  }, [initialData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
  const { name, value } = e.target;
  const updatedData = { ...formData, [name]: value };

  setFormData(updatedData);
  onDataChange(updatedData);

  if (validationTimeoutRef.current) {
    clearTimeout(validationTimeoutRef.current);
  }

  validationTimeoutRef.current = setTimeout(
    () => {
      const result = validateSingaporeAddress(updatedData);
      setValidationResult(result);
      onValidityChange(result.isValid);
    },
    name === "contactNumber" ? 300 : 100,
  );
};

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
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            placeholder="Name"
            className={
              touched.name && validationResult.errors.name ? "error" : ""
            }
          />
          <span>Name*</span>
          {touched.name && validationResult.errors.name && (
            <p className="error-text">{validationResult.errors.name}</p>
          )}
        </div>

        <div className="field">
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, contactNumber: true }))
            }
            placeholder="Phone number"
            className={
              touched.contactNumber && validationResult.errors.contactNumber
                ? "error"
                : ""
            }
          />
          <span>Phone *</span>
          {touched.contactNumber && validationResult.errors.contactNumber && (
            <p className="error-text">
              {validationResult.errors.contactNumber}
            </p>
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
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder="Email"
            className={
              touched.email && validationResult.errors.email ? "error" : ""
            }
          />
          <span>Email</span>
          {touched.email && validationResult.errors.email && (
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
              touched.street && validationResult.errors.street ? "error" : ""
            }`}
            placeholder="Address*"
            onChange={(val) => {
              const updated = { ...formData, street: val };
              setFormData(updated);
              onDataChange(updated);
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, street: true }))}
            onSelect={(s) => {
              const updated = {
                ...formData,
                street: s.address,
                postalCode: s.postalCode,
              };

              setFormData(updated);
              onDataChange(updated);
              setTouched((prev) => ({ ...prev, street: true }));

              const result = validateSingaporeAddress(updated);
              setValidationResult(result);
              onValidityChange(result.isValid);
            }}
          />

          {touched.street && validationResult.errors.street && (
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
            onBlur={() => setTouched((prev) => ({ ...prev, unitNo: true }))}
            placeholder="Unit"
            className={touched.unitNo && validationResult.errors.unitNo ? "error" : ""}
          />
          <span>Unit*</span>
          {touched.unitNo && validationResult.errors.unitNo && (
            <p className="error-text">{validationResult.errors.unitNo}</p>
          )}
        </div>

        <div className="field">
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            onBlur={() => setTouched((prev) => ({ ...prev, postalCode: true }))}
            placeholder="Postal code"
            className={
              touched.postalCode && validationResult.errors.postalCode
                ? "error"
                : ""
            }
          />
          <span>Postal code*</span>
          {touched.postalCode && validationResult.errors.postalCode && (
            <p className="error-text">{validationResult.errors.postalCode}</p>
          )}
        </div>
      </div>

      {showMemo && (
  <div className="address-grid one">
    <div className="field">
      <textarea
        name="memo"
        value={formData.memo ?? ""}
        onChange={handleChange}
        placeholder=" "
        maxLength={50}
      />
      <span>Memo</span>
      <p className="memo-count">{(formData.memo ?? "").length}/50</p>
    </div>
  </div>
)}
    </div>
  );
}
