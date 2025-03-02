export type ParcelSize = "2kg" | "5kg" | "10kg"
export type CollectionMethod = "dropoff" | "pickup"

export type DeliveryMethod = "atl" | "hand-to-hand"

export interface ParcelDimensions {
  weight: number
  length: number
  width: number
  height: number
}

export interface PricingTier {
  maxWeight: number
  maxVolumetric: number
  price: number
}

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

export const PRICING_TIERS: PricingTier[] = [
  {
    maxWeight: 4,
    maxVolumetric: 2,
    price: 3.5,
  },
  {
    maxWeight: 10,
    maxVolumetric: 10,
    price: 5.8,
  },
  {
    maxWeight: 20,
    maxVolumetric: 25,
    price: 10.3,
  },
  {
    maxWeight: 30,
    maxVolumetric: Number.POSITIVE_INFINITY,
    price: 17.4,
  },
]

export const HAND_TO_HAND_FEE = 2.5

export function calculateShippingPrice(dimensions: ParcelDimensions, deliveryMethod: DeliveryMethod): number {
  const { weight, length, width, height } = dimensions

  // Calculate volumetric weight (L x W x H / 5000)
  const volumetricWeight = (length * width * height) / 5000

  // Use the higher of actual weight and volumetric weight
  const effectiveWeight = Math.max(weight, volumetricWeight)

  // Find applicable pricing tier
  const tier =
    PRICING_TIERS.find((tier) => effectiveWeight <= tier.maxWeight && volumetricWeight <= tier.maxVolumetric) ||
    PRICING_TIERS[PRICING_TIERS.length - 1]

  // Add hand-to-hand fee if selected
  const handToHandFee = deliveryMethod === "hand-to-hand" ? HAND_TO_HAND_FEE : 0

  return tier.price + handToHandFee
}

