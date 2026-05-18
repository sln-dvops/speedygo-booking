import { z } from "zod"
import type { AddressFormData } from "@/components/ordering/shared/AddressForm"

// Singapore address validation schema
export const singaporeAddressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactNumber: z
    .string()
    .regex(/^[0-9+\-\s]{1,30}$/, "Phone number can contain only digits, +, -, and spaces (max 30 characters)"),
  email: z
  .string()
  .email("Please enter a valid email address")
  .optional()
  .or(z.literal("")),
  street: z.string().min(3, "Street address must be at least 3 characters"),
  unitNo: z
  .string()
  .trim()
  .min(1, "Please enter the unit number"),
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

