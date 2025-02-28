export type ParcelSize = "2kg" | "5kg" | "10kg"
export type CollectionMethod = "dropoff" | "pickup"

export const PRICING = {
  "2kg": {
    dropoff: { original: 4.49, discounted: 3.49 },
    pickup: { original: 7.49, discounted: 5.99 },
  },
  "5kg": {
    dropoff: { original: 5.49, discounted: 4.49 },
    pickup: { original: 8.49, discounted: 6.99 },
  },
  "10kg": {
    dropoff: { original: 6.49, discounted: 5.49 },
    pickup: { original: 9.49, discounted: 7.99 },
  },
} as const

export type PricingType = typeof PRICING

