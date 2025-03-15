"use client"

import { TermsAndConditions } from "./TermsAndConditions"

export function PaymentTerms() {
  return (
    <div className="text-sm text-gray-600">
      By proceeding, you are agreeing with our <TermsAndConditions />
    </div>
  )
}

