"use client"

import { useEffect, useRef, useState } from "react"
import { useSgAddressAutocomplete, type AddressSuggestion } from "@/hooks/useSgAddressAutocomplete"

type Props = {
  value: string
  onChange: (val: string) => void

  // when user selects a suggestion
  onSelect: (s: AddressSuggestion) => void

  placeholder?: string
  disabled?: boolean
  
  inputClassName?: string
}

export function AddressAutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = "Enter address",
  disabled,
  inputClassName
}: Props) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { results, loading, setResults } = useSgAddressAutocomplete(value, open && !disabled)

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const handlePick = (s: AddressSuggestion) => {
    onSelect(s)
    setOpen(false)
    setResults([])
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        className={inputClassName}
      />
      <span>{placeholder}</span>

      {open && (results.length > 0 || loading) && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border bg-white shadow-lg">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b">
            {loading ? "Searching..." : "Suggestions"}
          </div>

          <div className="max-h-64 overflow-auto">
            {results.map((s, idx) => (
              <button
                key={`${s.address}-${idx}`}
                type="button"
                onClick={() => handlePick(s)}
                className="w-full text-left px-3 py-3 hover:bg-gray-50 text-sm"
              >
                <div className="font-medium text-black">{s.address}</div>
                {s.postalCode && (
                  <div className="text-xs text-gray-500 mt-0.5">Postal: {s.postalCode}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
