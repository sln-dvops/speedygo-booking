/**
 * Utility functions for handling order IDs (both full UUIDs and short IDs)
 */

/**
 * Checks if the provided ID is a short ID (12 hexadecimal characters with optional "SPDY" prefix)
 */
export function isShortId(id: string): boolean {
  // Check for SPDY prefix followed by 12 hex characters
  if (id.startsWith("SPDY") && id.length === 16 && !/[^a-f0-9]/i.test(id.substring(4))) {
    return true
  }
  // Also support the original format (just 12 hex characters)
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
 * Extracts the actual short ID part from a prefixed ID
 * Returns the original ID if it doesn't have the prefix
 */
export function extractShortId(id: string): string {
  if (id.startsWith("SPDY") && id.length === 16) {
    return id.substring(4)
  }
  return id
}

/**
 * Validates an order ID (accepts short ID with or without SPDY prefix, UUID with hyphens, or UUID without hyphens)
 * Returns the formatted ID if valid, or null if invalid
 */
export function validateOrderId(id: string): string | null {
  // Clean the input (remove spaces and any non-alphanumeric characters except hyphens)
  const cleanedId = id.trim().replace(/[^a-zA-Z0-9-]/g, "")

  // Check if it's a short ID (with or without SPDY prefix)
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

/**
 * Adds the SPDY prefix to a short ID if it doesn't already have it
 */
export function addSpdyPrefix(shortId: string): string {
  if (shortId.startsWith("SPDY")) {
    return shortId
  }

  // If it's a 12-character hex string (original short ID format)
  if (shortId.length === 12 && !/[^a-f0-9]/i.test(shortId)) {
    return `SPDY${shortId}`
  }

  return shortId
}
