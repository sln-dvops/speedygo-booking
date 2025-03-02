import React from "react"
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges"
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog"

interface UnsavedChangesWrapperProps {
  children: React.ReactNode
}

export function UnsavedChangesWrapper({ children }: UnsavedChangesWrapperProps) {
  const { setUnsavedChanges, isDialogOpen, handleConfirmNavigation, handleCancelNavigation } = useUnsavedChanges()

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { setUnsavedChanges } as any)
        }
        return child
      })}
      <UnsavedChangesDialog
        isOpen={isDialogOpen}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
      />
    </>
  )
}

