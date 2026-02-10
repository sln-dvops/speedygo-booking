"use client"

import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Printer, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OrderWithParcels, RecipientDetails } from "@/types/order"
import { WaybillContent } from "./WaybillContent"
import { cn } from "@/lib/utils"

interface WaybillProps {
  orderDetails: OrderWithParcels
}

export function Waybill({ orderDetails }: WaybillProps) {
  const [currentWaybillIndex, setCurrentWaybillIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)
  const singleWaybillRef = useRef<HTMLDivElement>(null)
  const allWaybillsRef = useRef<HTMLDivElement>(null)

  const isBulkOrder = orderDetails.isBulkOrder && orderDetails.parcels.length > 1
  const totalWaybills = isBulkOrder ? orderDetails.parcels.length : 1

  // Define print styles to ensure consistency between preview and print
  const printStyles = `
    @page {
      size: 100mm 150mm;
      margin: 0;
    }
    
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .waybill-content-wrapper {
        width: 100mm !important;
        height: 150mm !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
        background-color: white !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      .waybill-content {
        width: 100mm !important;
        height: 150mm !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        background: white !important;
        border: none !important;
        box-shadow: none !important;
        transform: none !important;
      }
      
      .print-hidden {
        display: none !important;
      }
      
      .preview-wrapper {
        transform: none !important;
        border: none !important;
        box-shadow: none !important;
      }
    }
  `

  // Handle printing a single waybill
  const handlePrintSingle = useReactToPrint({
    documentTitle: `Waybill-${orderDetails.orderNumber || ""}${isBulkOrder ? `-${currentWaybillIndex + 1}` : ""}`,
    contentRef: singleWaybillRef,
    pageStyle: printStyles,
  })

  // Handle printing all waybills
  const handlePrintAll = useReactToPrint({
    documentTitle: `Waybills-${orderDetails.orderNumber || ""}`,
    contentRef: allWaybillsRef,
    pageStyle: printStyles,
  })

  const handlePrevWaybill = () => {
    setCurrentWaybillIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextWaybill = () => {
    setCurrentWaybillIndex((prev) => Math.min(totalWaybills - 1, prev + 1))
  }

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  // Get current recipient for bulk orders
  const getCurrentRecipient = (): RecipientDetails | null => {
    if (!isBulkOrder || !orderDetails.recipients) return null
    const recipient = orderDetails.recipients.find((r) => r.parcelIndex === currentWaybillIndex) || null
    return recipient
  }

  const currentRecipient = getCurrentRecipient()
  const currentParcel = orderDetails.parcels[currentWaybillIndex] || orderDetails.parcels[0]

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={toggleExpanded}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-bold text-black">Waybill</CardTitle>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
          {isBulkOrder && (
            <Badge variant="outline" className="bg-yellow-200 text-black border-black">
              Bulk Order ({totalWaybills} Parcels)
            </Badge>
          )}
        </div>
        {isExpanded && (
          <p className="text-black mt-2">Please print this shipping label and attach it to your parcel.</p>
        )}
      </CardHeader>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Print buttons */}
            <div className="flex justify-end gap-2 print-hidden">
              <Button onClick={() => handlePrintSingle()} className="bg-black hover:bg-black/90 text-yellow-400">
                <Printer className="mr-2 h-4 w-4" />
                Print Current Waybill
              </Button>

              {isBulkOrder && (
                <Button onClick={() => handlePrintAll()} className="bg-black hover:bg-black/90 text-yellow-400">
                  <Printer className="mr-2 h-4 w-4" />
                  Print All Waybills
                </Button>
              )}
            </div>

            {/* Navigation for bulk orders */}
            {isBulkOrder && (
              <div className="flex justify-between items-center print-hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevWaybill}
                  disabled={currentWaybillIndex === 0}
                  className="border-black text-black hover:bg-yellow-100"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="font-medium">
                  Waybill {currentWaybillIndex + 1} of {totalWaybills}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextWaybill}
                  disabled={currentWaybillIndex === totalWaybills - 1}
                  className="border-black text-black hover:bg-yellow-100"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Current waybill preview - this is what will be printed for single waybill */}
            <div className="flex justify-center" ref={singleWaybillRef}>
              <div
                className="preview-wrapper"
                style={{
                  width: "100mm",
                  height: "150mm",
                  transform: "scale(1)",
                  transformOrigin: "top center",
                  border: "none",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                }}
              >
                <WaybillContent
                  orderDetails={orderDetails}
                  parcel={currentParcel}
                  recipient={currentRecipient}
                  waybillIndex={currentWaybillIndex}
                />
              </div>
            </div>

            {/* Hidden container with all waybills for bulk printing */}
            <div style={{ display: "none" }}>
              <div ref={allWaybillsRef}>
                {isBulkOrder ? (
                  orderDetails.parcels.map((parcel, index) => (
                    <div key={index} className="waybill-content-wrapper">
                      <WaybillContent
                        orderDetails={orderDetails}
                        parcel={parcel}
                        recipient={orderDetails.recipients?.find((r) => r.parcelIndex === index)}
                        waybillIndex={index}
                      />
                    </div>
                  ))
                ) : (
                  <div className="waybill-content-wrapper">
                    <WaybillContent
                      orderDetails={orderDetails}
                      parcel={orderDetails.parcels[0]}
                      recipient={null}
                      waybillIndex={0}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Print instructions */}
            <div className="bg-yellow-100 p-4 rounded-lg print-hidden">
              <h3 className="font-medium text-black mb-2">Printing Instructions:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>
                  Click the &quot;Print {isBulkOrder ? `All Waybills (${totalWaybills})` : "Waybill"}&quot; button above
                </li>
                <li>Each waybill will print on a separate page</li>
                <li>Waybills are sized at 100mm × 150mm (portrait)</li>
                <li>For best results, use label paper or cut to size after printing</li>
                <li>Attach each printed waybill to its corresponding parcel</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 print-hidden">
          <p className="text-sm text-gray-500">
            Order #{orderDetails.orderNumber || ""} • {new Date().toLocaleDateString()}
          </p>
        </CardFooter>
      </div>
    </Card>
  )
}
