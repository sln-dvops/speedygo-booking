"use client"

import { useState, useEffect, useCallback } from "react"

export function useUnsavedChanges() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        // The following line is deprecated but still used for compatibility
        event.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (hasUnsavedChanges) {
      const handleRouteChange = () => {
        setIsDialogOpen(true)
        // Prevent the route change
        throw new Error("Route change aborted due to unsaved changes")
      }

      window.addEventListener("popstate", handleRouteChange)

      return () => {
        window.removeEventListener("popstate", handleRouteChange)
      }
    }
  }, [hasUnsavedChanges])

  const handleConfirmNavigation = useCallback(() => {
    setHasUnsavedChanges(false)
    setIsDialogOpen(false)
    // Use router.push here if you want to navigate programmatically
  }, [])

  const handleCancelNavigation = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  return {
    setUnsavedChanges: setHasUnsavedChanges,
    isDialogOpen,
    handleConfirmNavigation,
    handleCancelNavigation,
  }
}

