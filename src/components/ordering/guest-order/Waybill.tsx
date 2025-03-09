"use client"

import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, ChevronLeft, ChevronRight } from "lucide-react"
import QRCode from "react-qr-code"
import Barcode from "react-barcode"
import type { OrderWithParcels, RecipientDetails } from "@/types/order"
import type { ParcelDimensions } from "@/types/pricing"

interface WaybillProps {
  orderDetails: OrderWithParcels
}

interface WaybillContentProps {
  orderDetails: OrderWithParcels
  parcel: ParcelDimensions
  recipient: RecipientDetails | null | undefined
  waybillIndex?: number
}

// Update the main Waybill component to include print styles for the new dimensions
export function Waybill({ orderDetails }: WaybillProps) {
  const [currentWaybillIndex, setCurrentWaybillIndex] = useState(0)
  const singleWaybillRef = useRef<HTMLDivElement>(null)
  const allWaybillsRef = useRef<HTMLDivElement>(null)

  const isBulkOrder = orderDetails.isBulkOrder && orderDetails.parcels.length > 1
  const totalWaybills = isBulkOrder ? orderDetails.parcels.length : 1

  // Handle printing a single waybill with updated dimensions
  const handlePrintSingle = useReactToPrint({
    documentTitle: `Waybill-${orderDetails.orderNumber || ""}${isBulkOrder ? `-${currentWaybillIndex + 1}` : ""}`,
    contentRef: singleWaybillRef,
    pageStyle: `
    @page {
      size: 100mm 150mm;
      margin: 0;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .waybill-content {
        width: 100mm;
        height: 150mm;
        padding: 5mm;
        box-sizing: border-box;
        page-break-after: always;
      }
      button, .tabs, .tab-list, .print-hidden {
        display: none !important;
      }
    }
  `,
  })

  // Handle printing all waybills with updated dimensions
  const handlePrintAll = useReactToPrint({
    documentTitle: `Waybills-${orderDetails.orderNumber || ""}`,
    contentRef: allWaybillsRef,
    pageStyle: `
    @page {
      size: 100mm 150mm;
      margin: 0;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .waybill-content {
        width: 100mm;
        height: 150mm;
        padding: 5mm;
        box-sizing: border-box;
        page-break-after: always;
      }
      button, .tabs, .tab-list, .print-hidden {
        display: none !important;
      }
    }
  `,
  })

  const handlePrevWaybill = () => {
    setCurrentWaybillIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextWaybill = () => {
    setCurrentWaybillIndex((prev) => Math.min(totalWaybills - 1, prev + 1))
  }

  // Get current recipient for bulk orders
  const getCurrentRecipient = (): RecipientDetails | null => {
    if (!isBulkOrder || !orderDetails.recipients) return null
    return orderDetails.recipients.find((r) => r.parcelIndex === currentWaybillIndex) || null
  }

  const currentRecipient = getCurrentRecipient()
  const currentParcel = orderDetails.parcels[currentWaybillIndex] || orderDetails.parcels[0]

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-black">Waybill</CardTitle>
          {isBulkOrder && (
            <Badge variant="outline" className="bg-yellow-200 text-black border-black">
              Bulk Order ({totalWaybills} Parcels)
            </Badge>
          )}
        </div>
      </CardHeader>
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

          {/* Current waybill preview */}
          <div className="border border-gray-300 rounded-lg p-0 bg-white flex justify-center" ref={singleWaybillRef}>
            <div
              className="waybill-preview"
              style={{ width: "100mm", height: "150mm", padding: "5mm", border: "1px dashed #ccc" }}
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
                  <div key={index} className="waybill-content page-break-after">
                    <WaybillContent
                      orderDetails={orderDetails}
                      parcel={parcel}
                      recipient={orderDetails.recipients?.find((r) => r.parcelIndex === index)}
                      waybillIndex={index}
                    />
                  </div>
                ))
              ) : (
                <div className="waybill-content">
                  <WaybillContent orderDetails={orderDetails} parcel={orderDetails.parcels[0]} waybillIndex={0} />
                </div>
              )}
            </div>
          </div>

          {/* Print instructions */}
          <div className="bg-yellow-100 p-4 rounded-lg print-hidden">
            <h3 className="font-medium text-black mb-2">Printing Instructions:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Click the &quot;Print {isBulkOrder ? "All Waybills" : "Waybill"}&quot; button above</li>
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
    </Card>
  )
}

// Update the WaybillContent component to be portrait-oriented and fit 150mm x 100mm
function WaybillContent({ orderDetails, parcel, recipient, waybillIndex = 0 }: WaybillContentProps) {
  const isBulkOrder = orderDetails.isBulkOrder && orderDetails.parcels.length > 1

  // For bulk orders, use the recipient details if available
  const recipientName = recipient ? recipient.name : orderDetails.recipientName
  const recipientAddress = recipient
    ? `${recipient.line1}, ${recipient.line2 || ""}, ${recipient.postalCode}, Singapore`
    : orderDetails.recipientAddress
  const recipientContact = recipient ? recipient.contactNumber : orderDetails.recipientContactNumber
  const recipientEmail = recipient ? recipient.email : orderDetails.recipientEmail

  // Generate a unique tracking number for each parcel in a bulk order
  const trackingNumber = isBulkOrder
    ? `${orderDetails.orderNumber || ""}-${waybillIndex + 1}`
    : orderDetails.orderNumber || "TEMP-ORDER"

  return (
    <div className="waybill-content space-y-3 text-black text-sm" style={{ width: "100mm", height: "150mm" }}>
      {/* Header with logo and waybill info */}
      <div className="flex justify-between items-start border-b border-black pb-2">
        <div>
          <h2 className="text-base font-bold">Speedy Xpress</h2>
          <p className="text-xs">Fast & Reliable Delivery</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xs">Waybill #{trackingNumber}</p>
          <p className="text-xs">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* From section */}
      <div className="pt-1">
        <h3 className="font-bold text-xs border-b border-gray-300 pb-1 mb-1">FROM:</h3>
        <p className="font-medium text-xs">{orderDetails.senderName}</p>
        <p className="text-xs">{orderDetails.senderAddress}</p>
        <p className="text-xs">Contact: {orderDetails.senderContactNumber}</p>
      </div>

      {/* To section */}
      <div className="pt-1">
        <h3 className="font-bold text-xs border-b border-gray-300 pb-1 mb-1">TO:</h3>
        <p className="font-medium text-xs">{recipientName}</p>
        <p className="text-xs">{recipientAddress}</p>
        <p className="text-xs">Contact: {recipientContact}</p>
      </div>

      {/* Parcel details */}
      <div className="border-t border-b border-gray-300 py-2">
        <h3 className="font-bold text-xs mb-1">PARCEL DETAILS:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs">
              <span className="font-medium">Weight:</span> {parcel.weight} kg
            </p>
            <p className="text-xs">
              <span className="font-medium">Dimensions:</span> {parcel.length}×{parcel.width}×{parcel.height} cm
            </p>
            <p className="text-xs">
              <span className="font-medium">Delivery:</span>{" "}
              {orderDetails.deliveryMethod === "atl" ? "At Location" : "Hand-to-Hand"}
            </p>
            {isBulkOrder && (
              <p className="text-xs">
                <span className="font-medium">Parcel:</span> {waybillIndex + 1} of {orderDetails.parcels.length}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <QRCode value={trackingNumber} size={50} />
          </div>
        </div>
      </div>

      {/* Barcode */}
      <div className="flex justify-center py-2">
        <Barcode value={trackingNumber} width={1} height={30} fontSize={10} margin={0} />
      </div>
    </div>
  )
}

