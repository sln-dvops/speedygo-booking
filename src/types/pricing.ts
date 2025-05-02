export type ParcelSize = "2kg" | "5kg" | "10kg"
export type CollectionMethod = "dropoff" | "pickup"
export type DeliveryMethod = "atl" | "hand-to-hand"

export interface ParcelDimensions {
  weight: number // in kg
  length: number // in cm
  width: number // in cm
  height: number // in cm
  effectiveWeight: number
  id?: string
  short_id?: string
  pricingTier?: string
}

export interface PricingTier {
  maxWeight: number // in kg
  maxVolumetric: number // in kg/cm³
  price: number // in SGD
}

// Pricing tiers exactly matching the client's table
export const PRICING_TIERS: PricingTier[] = [
  {
    maxWeight: 4, // 0kg ≤ 4kg
    maxVolumetric: 2, // 0 kg/cm³ ≤ 2kg/cm³
    price: 3.5,
  },
  {
    maxWeight: 10, // 4kg ≤ 10kg
    maxVolumetric: 10, // 2 kg/cm³ ≤ 10kg/cm³
    price: 5.8,
  },
  {
    maxWeight: 20, // 10kg ≤ 20kg
    maxVolumetric: 25, // 10 kg/cm³ ≤ 25kg/cm³
    price: 10.3,
  },
  {
    maxWeight: 30, // 20kg ≤ 30kg
    maxVolumetric: Number.POSITIVE_INFINITY, // 25kg/cm³ onwards
    price: 17.4,
  },
]


export const HAND_TO_HAND_FEE = 2.5

/**
 * The divisor 5000 is an industry standard conversion factor used in logistics.
 * It converts dimensional weight from cm³ to kg using the formula:
 * Volumetric Weight (kg) = (Length × Width × Height) ÷ 5000
 *
 * This factor assumes an average density of 200 kg/m³:
 * - 1 m³ = 1,000,000 cm³
 * - 200 kg/m³ = 200 kg/1,000,000 cm³
 * - Therefore: 1 kg = 5000 cm³
 *
 * This is why we divide by 5000 to convert volume in cm³ to equivalent weight in kg.
 */
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

/**
 * Helper function to convert volumetric measurements to kg/cm³
 * This is useful for debugging and verification against the pricing table
 */
export function calculateVolumetricDensity(length: number, width: number, height: number, weight: number): number {
  const volume = length * width * height // in cm³
  return weight / volume // gives kg/cm³
}

/**
 * Determine the pricing tier (T1, T2, T3, T4) based on parcel dimensions
 */
export function determinePricingTier(dimensions: ParcelDimensions): string {
  const { weight, length, width, height } = dimensions

  // Calculate volumetric weight
  const volumetricWeight = (length * width * height) / 5000

  // Use the higher of actual weight and volumetric weight
  const effectiveWeight = Math.max(weight, volumetricWeight)

  // Find applicable pricing tier
  for (let i = 0; i < PRICING_TIERS.length; i++) {
    const tier = PRICING_TIERS[i]
    if (effectiveWeight <= tier.maxWeight && volumetricWeight <= tier.maxVolumetric) {
      return `T${i + 1}` // T1, T2, T3, T4
    }
  }

  // Default to highest tier if no match found
  return `T${PRICING_TIERS.length}`
}
