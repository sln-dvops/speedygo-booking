"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, Check, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import type { ParcelDimensions } from "@/types/pricing"

interface CsvUploaderProps {
  setParcels: React.Dispatch<React.SetStateAction<ParcelDimensions[]>>
  isValidDimensions: (dimensions: ParcelDimensions) => boolean
}

export function CsvUploader({ setParcels, isValidDimensions }: CsvUploaderProps) {
  const [csvUploadStatus, setCsvUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [csvErrorMessage, setCsvErrorMessage] = useState<string>("")
  const [uploadedParcelCount, setUploadedParcelCount] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset status
    setCsvUploadStatus("idle")
    setCsvErrorMessage("")

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const parsedParcels = parseCsv(csvText)

        if (parsedParcels.length === 0) {
          setCsvUploadStatus("error")
          setCsvErrorMessage("No valid parcel data found in CSV file")
          return
        }

        // Validate all parcels
        const invalidParcels = parsedParcels.filter((parcel) => !isValidDimensions(parcel))
        if (invalidParcels.length > 0) {
          setCsvUploadStatus("error")
          setCsvErrorMessage(`${invalidParcels.length} parcels have invalid dimensions. Please check your CSV file.`)
          return
        }

        // Set the parcels
        setParcels(parsedParcels)
        setUploadedParcelCount(parsedParcels.length)
        setCsvUploadStatus("success")

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (error) {
        console.error("Error parsing CSV:", error)
        setCsvUploadStatus("error")
        setCsvErrorMessage("Failed to parse CSV file. Please check the format.")
      }
    }

    reader.onerror = () => {
      setCsvUploadStatus("error")
      setCsvErrorMessage("Error reading the file")
    }

    reader.readAsText(file)
  }

  const parseCsv = (csvText: string): ParcelDimensions[] => {
    // Split by lines and remove empty lines
    const lines = csvText.split("\n").filter((line) => line.trim() !== "")

    // Check if we have at least one data row (plus header)
    if (lines.length < 2) {
      throw new Error("CSV file must contain a header row and at least one data row")
    }

    // Get header row and check required columns
    const header = lines[0].split(",").map((col) => col.trim().toLowerCase())
    const requiredColumns = ["weight", "length", "width", "height"]

    // Check if all required columns exist
    const missingColumns = requiredColumns.filter((col) => !header.includes(col))
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`)
    }

    // Get column indices
    const weightIndex = header.indexOf("weight")
    const lengthIndex = header.indexOf("length")
    const widthIndex = header.indexOf("width")
    const heightIndex = header.indexOf("height")

    // Parse data rows
    const parcels: ParcelDimensions[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((val) => val.trim())

      // Skip rows with insufficient values
      if (values.length <= Math.max(weightIndex, lengthIndex, widthIndex, heightIndex)) {
        continue
      }

      const parcel: ParcelDimensions = {
        weight: Number.parseFloat(values[weightIndex]) || 0,
        length: Number.parseFloat(values[lengthIndex]) || 0,
        width: Number.parseFloat(values[widthIndex]) || 0,
        height: Number.parseFloat(values[heightIndex]) || 0,
      }

      // Only add valid parcels
      if (isValidDimensions(parcel)) {
        parcels.push(parcel)
      }
    }

    return parcels
  }

  const handleCsvButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Get the template file path directly from environment variable
  const templateFilePath = process.env.NEXT_PUBLIC_CSV_TEMPLATE_URL || ""

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium text-black mb-2">Bulk Upload Parcels</h3>
      <p className="text-sm text-gray-600 mb-4">
        Upload a CSV file with parcel details. The CSV must include columns for weight, length, width, and height.
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
        <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleCsvUpload} />

        <Button variant="outline" className="border-black text-black hover:bg-yellow-100" asChild>
          <a href={templateFilePath} download="parcel_template.csv">
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
                weight,length,width,height
                <br />
                5,30,20,15
                <br />
                10,40,30,20
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
            {uploadedParcelCount} {uploadedParcelCount === 1 ? "parcel" : "parcels"} successfully imported.
          </AlertDescription>
        </Alert>
      )}

      {csvUploadStatus === "error" && (
        <Alert className="mt-3 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Error</AlertTitle>
          <AlertDescription className="text-red-600">{csvErrorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

