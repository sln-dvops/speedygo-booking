"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type OneMapResult = {
  SEARCHVAL?: string
  ADDRESS?: string
  ROAD_NAME?: string
  BUILDING?: string
  POSTAL?: string
  LATITUDE?: string
  LONGITUDE?: string
}

export type AddressSuggestion = {
  label: string        // what you show in the list
  address: string      // full address string
  postalCode: string   // 6-digit
}

function extractPostalFromText(text: string): string {
  const m = text.match(/\b(\d{6})\b/)
  return m?.[1] ?? ""
}

export function useSgAddressAutocomplete(query: string, enabled: boolean) {
  const [results, setResults] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const trimmed = useMemo(() => query.trim(), [query])

  useEffect(() => {
    if (!enabled) {
      setResults([])
      return
    }

    // Don’t spam API for super short inputs
    if (trimmed.length < 3) {
      setResults([])
      return
    }

    const t = setTimeout(async () => {
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac

      setLoading(true)
      try {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
          trimmed
        )}&returnGeom=N&getAddrDetails=Y&pageNum=1`

        const res = await fetch(url, { signal: ac.signal })
        if (!res.ok) throw new Error(`OneMap error: ${res.status}`)
        const data = await res.json()

        const list: AddressSuggestion[] = (data?.results ?? [])
          .map((r: OneMapResult) => {
            const address = (r.ADDRESS || r.SEARCHVAL || "").trim()
            const postal = (r.POSTAL || extractPostalFromText(address)).trim()

            if (!address) return null
            return {
              label: address,
              address,
              postalCode: postal,
            }
          })
          .filter(Boolean)

        setResults(list)
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    }, 250) // debounce

    return () => clearTimeout(t)
  }, [trimmed, enabled])

  return { results, loading, setResults }
}
