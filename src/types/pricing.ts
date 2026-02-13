export type ParcelSize = "2kg" | "5kg" | "10kg"
export type CollectionMethod = "dropoff" | "pickup"
export type DeliveryMethod = "atl" | "hand-to-hand"
// ParcelDimensions (future-safe)
export interface ParcelDimensions {
  weight: number
  length?: number
  width?: number
  height?: number
  id?: string
  short_id?: string
  pricingTier?: string
}

export interface PricingTier {
  name: string // T1, T2, T3, T4
  maxWeight: number // in kg
  price: number // in SGD
}
export const PRICING_TIERS: PricingTier[] = [
  { name: "T1", maxWeight: 4, price: 4.5 },
  { name: "T2", maxWeight: 10, price: 5.8 },
  { name: "T3", maxWeight: 20, price: 10.3 },
  { name: "T4", maxWeight: 30, price: 17.4 },
]

export interface LocationSurcharge {
  name: string
  amount: number
  postalSectors: number[]
  areas?: string[]
}
export const LOCATION_SURCHARGES: LocationSurcharge[] = [
  {
    name: "Tier 1",
    amount: 4,
    postalSectors: [1,2,3,4,5,6,7,8,22,23,63],
  },
  {
    name: "Tier 2",
    amount: 6,
    postalSectors: [9,69],
  },

]
export function getPostalSector(postalCode: string): number | null {
  if (!postalCode || postalCode.length < 2) return null
  const sector = Number(postalCode.slice(0, 2))
  return Number.isNaN(sector) ? null : sector
}

export function calculateLocationSurcharge(postalCode: string): number {
  const sector = getPostalSector(postalCode)
  if (sector === null) return 0

  for (const tier of LOCATION_SURCHARGES) {
    if (tier.postalSectors.includes(sector)) {
      return tier.amount
    }
  }

  return 0
}


export const HAND_TO_HAND_FEE = 2.5
/**
 * SINGLE SOURCE OF TRUTH
 * Determines pricing tier based ONLY on actual weight
 */
export function getPricingTierByWeight(weight: number): PricingTier {
  let tier = PRICING_TIERS[PRICING_TIERS.length - 1]

  for (const t of PRICING_TIERS) {
    if (weight <= t.maxWeight) {
      tier = t
      break
    }
  }

  console.log(`Pricing calculation:
    - Actual weight: ${weight}kg
    - Tier applied: ${tier.name}
    - Base price: $${tier.price}
  `)

  return tier
}
export function calculateShippingPrice(
  dimensions: ParcelDimensions,
  deliveryMethod: DeliveryMethod
): number {
  const tier = getPricingTierByWeight(dimensions.weight)
  const handToHandFee = deliveryMethod === "hand-to-hand" ? HAND_TO_HAND_FEE : 0
  return tier.price + handToHandFee
}

/**
 * Determine the pricing tier name (T1, T2, T3, T4) based on parcel dimensions
 */
export function determinePricingTier(dimensions: ParcelDimensions): string {
  return getPricingTierByWeight(dimensions.weight).name
}
