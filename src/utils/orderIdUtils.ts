/**
 * Utility functions for handling order IDs (both full UUIDs and short IDs)
 */

/**
 * Checks if the provided ID is a short ID (12 hexadecimal characters)
 */
export function isShortId(id: string): boolean {
    return id.length === 12 && !/[^a-f0-9]/i.test(id)
  }
  
  /**
   * Checks if the provided ID is a valid UUID with hyphens
   */
  export function isFullUuid(id: string): boolean {
    const uuidRegexWithHyphens = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegexWithHyphens.test(id)
  }
  
  /**
   * Checks if the provided ID is a valid UUID without hyphens (32 hexadecimal characters)
   */
  export function isUuidWithoutHyphens(id: string): boolean {
    const uuidRegexWithoutHyphens = /^[0-9a-f]{32}$/i
    return uuidRegexWithoutHyphens.test(id)
  }
  
  /**
   * Formats a UUID without hyphens to include hyphens
   */
  export function formatUuidWithHyphens(id: string): string {
    if (isUuidWithoutHyphens(id)) {
      return [id.slice(0, 8), id.slice(8, 12), id.slice(12, 16), id.slice(16, 20), id.slice(20)].join("-")
    }
    return id
  }
  
  /**
   * Validates an order ID (accepts short ID, UUID with hyphens, or UUID without hyphens)
   * Returns the formatted ID if valid, or null if invalid
   */
  export function validateOrderId(id: string): string | null {
    // Clean the input (remove spaces and any non-alphanumeric characters except hyphens)
    const cleanedId = id.trim().replace(/[^a-zA-Z0-9-]/g, "")
  
    // Check if it's a short ID
    if (isShortId(cleanedId)) {
      return cleanedId
    }
  
    // Check if it's a UUID without hyphens and format it
    if (isUuidWithoutHyphens(cleanedId)) {
      return formatUuidWithHyphens(cleanedId)
    }
  
    // Check if it's already a valid UUID with hyphens
    if (isFullUuid(cleanedId)) {
      return cleanedId
    }
  
    // Not a valid order ID
    return null
  }
  
  /**
   * Extracts the short ID from a full UUID (last 12 characters)
   */
  export function getShortIdFromUuid(uuid: string): string {
    // Remove hyphens if present
    const cleanUuid = uuid.replace(/-/g, "")
    // Return the last 12 characters
    return cleanUuid.slice(-12)
  }
  
  