import { z } from "zod"
import type { AddressFormData } from "@/components/ordering/shared/AddressForm"

// Singapore address validation schema
export const singaporeAddressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactNumber: z
    .string()
    .regex(/^[0-9+\-\s]{1,30}$/, "Phone number can contain only digits, +, -, and spaces (max 30 characters)"),
  email: z.string().email("Please enter a valid email address"),
  street: z.string().min(3, "Street address must be at least 3 characters"),
  unitNo: z
    .string()
    .regex(/^#?\d{1,3}(-\d{1,3})?$/, "Unit number should be in format #01-01 or 01-01")
    .optional()
    .or(z.literal("")),
  postalCode: z.string().regex(/^\d{6}$/, "Singapore postal codes must be 6 digits"),
})

export type SingaporeAddressSchema = z.infer<typeof singaporeAddressSchema>

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateSingaporeAddress(data: AddressFormData): ValidationResult {
  try {
    singaporeAddressSchema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { form: "Invalid form data" } }
  }
}

