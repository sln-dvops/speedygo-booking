"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, Check, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { ParcelDimensions } from "@/types/pricing"
import type { RecipientDetails } from "@/types/order"

interface CsvUploaderProps {
  setParcels: (parcels: ParcelDimensions[]) => void
  setRecipients: (recipients: RecipientDetails[]) => void
}

export function CsvUploader({ setParcels, setRecipients }: CsvUploaderProps) {
  const [csvUploadStatus, setCsvUploadStatus] =
    useState<"idle" | "success" | "error">("idle")
  const [csvErrorMessage, setCsvErrorMessage] = useState("")
  const [uploadedParcelCount, setUploadedParcelCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvUploadStatus("idle")
    setCsvErrorMessage("")

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const { parcels, recipients } = parseCsv(csvText)

        if (parcels.length === 0) {
          throw new Error("No valid parcel data found in CSV file")
        }

        setParcels(parcels)
        setRecipients(recipients)
        setUploadedParcelCount(parcels.length)
        setCsvUploadStatus("success")

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (err) {
        console.error("CSV parse error:", err)
        setCsvUploadStatus("error")
        setCsvErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to parse CSV file"
        )
      }
    }

    reader.onerror = () => {
      setCsvUploadStatus("error")
      setCsvErrorMessage("Error reading the CSV file")
    }

    reader.readAsText(file)
  }

  const parseCsv = (csvText: string): {
    parcels: ParcelDimensions[]
    recipients: RecipientDetails[]
  } => {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length < 2) {
      throw new Error("CSV must contain a header row and at least one data row")
    }

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase())

    // REQUIRED COLUMNS (weight-only)
    const requiredColumns = [
      "weight",
      "name",
      "contactnumber",
      "email",
      "street",
      "unitno",
      "postalcode",
    ]

    const missing = requiredColumns.filter((c) => !header.includes(c))
    if (missing.length > 0) {
      throw new Error(
        `Missing required columns: ${missing.join(", ")}`
      )
    }

    const idx = (col: string) => header.indexOf(col)

    const parcels: ParcelDimensions[] = []
    const recipients: RecipientDetails[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())

      const weight = Number.parseFloat(values[idx("weight")])
      if (!weight || weight <= 0 || weight > 30) continue

      const parcel: ParcelDimensions = {
        weight,
      }

      const recipient: RecipientDetails = {
        name: values[idx("name")],
        contactNumber: values[idx("contactnumber")],
        email: values[idx("email")],
        line1: values[idx("street")],
        line2: values[idx("unitno")],
        postalCode: values[idx("postalcode")],
        address: `${values[idx("street")]}, ${values[idx(
          "unitno"
        )]}, ${values[idx("postalcode")]}, Singapore`,
        parcelIndex: parcels.length,
      }

      parcels.push(parcel)
      recipients.push(recipient)
    }

    return { parcels, recipients }
  }

  const handleCsvButtonClick = () => {
    fileInputRef.current?.click()
  }

  const templateFilePath = "/templates/parcel_and_recipient_template.csv"


  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium text-black mb-2">
        Bulk Upload Parcels & Recipients
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Upload a CSV file containing parcel weights and recipient details.
        Pricing is calculated based on the weight.
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="border-black text-black hover:bg-yellow-100"
          onClick={handleCsvButtonClick}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleCsvUpload}
        />

        <Button
          variant="outline"
          className="border-black text-black hover:bg-yellow-100"
          asChild
        >
          <a
            href={templateFilePath}
            download="parcel_and_recipient_template.csv"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </a>
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <FileText className="h-4 w-4 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                CSV Format:
                <br />
                weight,name,contactNumber,email,street,unitNo,postalCode
                <br />
                5,John Doe,12345678,john@example.com,123 Main St,#01-01,123456
                <br />
                10,Jane Smith,87654321,jane@example.com,456 Elm St,#02-02,654321
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {csvUploadStatus === "success" && (
        <Alert className="mt-3 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Success</AlertTitle>
          <AlertDescription className="text-green-600">
            {uploadedParcelCount} parcel
            {uploadedParcelCount !== 1 && "s"} successfully imported.
          </AlertDescription>
        </Alert>
      )}

      {csvUploadStatus === "error" && (
        <Alert className="mt-3 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Error</AlertTitle>
          <AlertDescription className="text-red-600">
            {csvErrorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
