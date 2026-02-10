export type ParcelSize = "2kg" | "5kg" | "10kg"
export type CollectionMethod = "dropoff" | "pickup"
export type DeliveryMethod = "atl" | "hand-to-hand"

export interface ParcelDimensions {
  weight: number // in kg
  length: number // in cm
  width: number // in cm
  height: number // in cm

  id?: string
  short_id?: string
  pricingTier?: string
}

export interface PricingTier {
  name: string // T1, T2, T3, T4
  maxWeight: number // in kg
  maxVolumetric: number // in kg/cm³
  price: number // in SGD
}

// Pricing tiers exactly matching the client's table
export const PRICING_TIERS: PricingTier[] = [
  {
    name: "T1",
    maxWeight: 4, // 0kg ≤ 4kg
    maxVolumetric: 2, // 0 kg/cm³ ≤ 2kg/cm³
    price: 4.5, // amended
  },
  {
    name: "T2",
    maxWeight: 10, // 4kg < weight ≤ 10kg
    maxVolumetric: 10, // 2 kg/cm³ < volumetric ≤ 10kg/cm³
    price: 5.8,
  },
  {
    name: "T3",
    maxWeight: 20, // 10kg < weight ≤ 20kg
    maxVolumetric: 25, // 10 kg/cm³ < volumetric ≤ 25kg/cm³
    price: 10.3,
  },
  {
    name: "T4",
    maxWeight: 30, // 20kg < weight ≤ 30kg
    maxVolumetric: Number.POSITIVE_INFINITY, // 25kg/cm³ < volumetric
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
export function calculateVolumetricWeight(length: number, width: number, height: number): number {
  return (length * width * height) / 5000
}

/**
 * SINGLE SOURCE OF TRUTH for determining the pricing tier based on dimensions
 * Returns the pricing tier object that should be used for the given dimensions
 */
export function getPricingTier(dimensions: ParcelDimensions): {
  tier: PricingTier
  actualWeightTier: PricingTier
  volumetricWeightTier: PricingTier
  volumetricWeight: number
} {
  const { weight, length, width, height } = dimensions

  // Calculate volumetric weight
  const volumetricWeight = calculateVolumetricWeight(length, width, height)

  // Find applicable pricing tier based on actual weight
  let actualWeightTier = PRICING_TIERS[PRICING_TIERS.length - 1]
  for (const tier of PRICING_TIERS) {
    if (weight <= tier.maxWeight) {
      actualWeightTier = tier
      break
    }
  }

  // Find applicable pricing tier based on volumetric weight
  let volumetricWeightTier = PRICING_TIERS[PRICING_TIERS.length - 1]
  for (const tier of PRICING_TIERS) {
    if (volumetricWeight <= tier.maxVolumetric) {
      volumetricWeightTier = tier
      break
    }
  }

  // Use the higher tier (the one with the higher price)
  const tier = actualWeightTier.price > volumetricWeightTier.price ? actualWeightTier : volumetricWeightTier

  // Log the detailed calculation for debugging
  console.log(`Pricing calculation:
    - Actual weight: ${weight}kg (${actualWeightTier.name})
    - Volumetric weight: ${volumetricWeight.toFixed(2)}kg (${volumetricWeightTier.name})
    - Effective tier: ${tier.name}
  `)

  return {
    tier,
    actualWeightTier,
    volumetricWeightTier,
    volumetricWeight,
  }
}

/**
 * Calculate the shipping price based on dimensions and delivery method
 */
export function calculateShippingPrice(dimensions: ParcelDimensions, deliveryMethod: DeliveryMethod): number {
  // Get the pricing tier using our single source of truth
  const { tier } = getPricingTier(dimensions)

  // Add hand-to-hand fee if selected
  const handToHandFee = deliveryMethod === "hand-to-hand" ? HAND_TO_HAND_FEE : 0

  return tier.price + handToHandFee
}

/**
 * Determine the pricing tier name (T1, T2, T3, T4) based on parcel dimensions
 */
export function determinePricingTier(dimensions: ParcelDimensions): string {
  // Get the pricing tier using our single source of truth
  const { tier } = getPricingTier(dimensions)
  return tier.name
}

/**
 * Helper function to convert volumetric measurements to kg/cm³
 * This is useful for debugging and verification against the pricing table
 */
export function calculateVolumetricDensity(length: number, width: number, height: number, weight: number): number {
  const volume = length * width * height // in cm³
  return weight / volume // gives kg/cm³
}
