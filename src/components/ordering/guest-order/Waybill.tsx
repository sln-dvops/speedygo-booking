"use client"

import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, ChevronLeft, ChevronRight, Package } from "lucide-react"
import QRCode from "react-qr-code"
import Barcode from "react-barcode"
import type { OrderWithParcels, RecipientDetails } from "@/types/order"
import type { ParcelDimensions } from "@/types/pricing"

interface WaybillProps {
  orderDetails: OrderWithParcels
}

// Fix the WaybillContentProps interface to make recipient optional
interface WaybillContentProps {
  orderDetails: OrderWithParcels
  parcel: ParcelDimensions & { pricingTier?: string }
  recipient?: RecipientDetails | null | undefined
  waybillIndex?: number
}

// Update the main Waybill component to include print styles for the new dimensions
export function Waybill({ orderDetails }: WaybillProps) {
  const [currentWaybillIndex, setCurrentWaybillIndex] = useState(0)
  const singleWaybillRef = useRef<HTMLDivElement>(null)
  const allWaybillsRef = useRef<HTMLDivElement>(null)

  const isBulkOrder = orderDetails.isBulkOrder && orderDetails.parcels.length > 1
  const totalWaybills = isBulkOrder ? orderDetails.parcels.length : 1

  const printStyles = `
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
      width: 100mm !important;
      height: 150mm !important;
      padding: 4mm !important;
      box-sizing: border-box !important;
      page-break-after: always !important;
      transform: none !important;
    }
    .print-hidden {
      display: none !important;
    }
  }
`

  // Handle printing a single waybill with updated dimensions
  const handlePrintSingle = useReactToPrint({
    documentTitle: `Waybill-${orderDetails.orderNumber || ""}${isBulkOrder ? `-${currentWaybillIndex + 1}` : ""}`,
    contentRef: singleWaybillRef,
    pageStyle: printStyles,
  })

  // Handle printing all waybills with updated dimensions
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
          <div className="border border-gray-300 rounded-lg p-4 bg-white flex justify-center" ref={singleWaybillRef}>
            <div
              className="waybill-preview"
              style={{
                width: "100mm",
                height: "150mm",
                transform: "scale(0.9)",
                transformOrigin: "top center",
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
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

// Update the WaybillContent component to use the pricing tier from the database
// and maintain the layout as requested
function WaybillContent({ orderDetails, parcel, recipient, waybillIndex = 0 }: WaybillContentProps) {
  const isBulkOrder = orderDetails.isBulkOrder && orderDetails.parcels.length > 1

  // For bulk orders, use the recipient details if available
  const recipientName = recipient ? recipient.name : orderDetails.recipientName
  const recipientAddress = recipient
    ? `${recipient.line1}, ${recipient.line2 || ""}, ${recipient.postalCode}, Singapore`
    : orderDetails.recipientAddress
  const recipientContact = recipient ? recipient.contactNumber : orderDetails.recipientContactNumber

  // Generate a unique tracking number for each parcel in a bulk order
  const trackingNumber = isBulkOrder
    ? `${orderDetails.orderNumber || ""}-${waybillIndex + 1}`
    : orderDetails.orderNumber || "TEMP-ORDER"

  // Get the pricing tier from the parcel or recipient
  const pricingTier = parcel.pricingTier || recipient?.pricingTier || "T1"

  return (
    <div className="relative bg-white" style={{ width: "100mm", height: "150mm", padding: "4mm" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <span className="text-lg font-bold">SPEEDY XPRESS</span>
        </div>
        <span className="text-3xl font-bold">{pricingTier}</span>
      </div>

      {/* Seller Info */}
      <div className="mb-2">
        <div className="bg-black text-white px-2 py-0.5 text-xs font-bold">Seller info</div>
        <div className="border border-t-0 border-black p-2 text-sm">
          <div>
            <span className="font-bold">Name: </span>
            {orderDetails.senderName}
          </div>
          <div>
            <span className="font-bold">Address: </span>
            {orderDetails.senderAddress}
          </div>
          <div>
            <span className="font-bold">Contact: </span>
            {orderDetails.senderContactNumber}
          </div>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="mb-2">
        <div className="bg-black text-white px-2 py-0.5 text-xs font-bold">Buyer info</div>
        <div className="border border-t-0 border-black p-2 text-sm">
          <div>
            <span className="font-bold">Name: </span>
            {recipientName}
          </div>
          <div>
            <span className="font-bold">Address: </span>
            {recipientAddress}
          </div>
          <div>
            <span className="font-bold">Contact: </span>
            {recipientContact}
          </div>
        </div>
      </div>

      {/* Item Table */}
      <div className="mb-2">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-2 py-0.5 text-left text-xs font-bold">ITEM</th>
              <th className="px-2 py-0.5 text-center w-16 text-xs font-bold">QTY</th>
            </tr>
          </thead>
          <tbody className="border border-t-0 border-black">
            <tr className="border-b border-black">
              <td className="px-2 py-1">
                {parcel.weight}kg • {parcel.length}×{parcel.width}×{parcel.height}cm
              </td>
              <td className="px-2 py-1 text-center">1</td>
            </tr>
            <tr>
              <td className="px-2 py-1">
                {orderDetails.deliveryMethod === "atl" ? "ATL Delivery" : "Hand-to-Hand Delivery"}
              </td>
              <td className="px-2 py-1 text-center">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* QR Code and Delivery Type Indicator side by side */}
      <div className="flex justify-between items-center mt-4">
        {/* QR Code on the left */}
        <div>
          <QRCode value={trackingNumber} size={85} style={{ height: "auto", maxWidth: "100%", width: "85px" }} />
        </div>

        {/* Delivery Type Indicator on the right - Very large for elderly visibility */}
        <div className="text-right">
          <div className="text-8xl font-black" style={{ lineHeight: "0.9" }}>
            {orderDetails.deliveryMethod === "atl" ? "ATL" : "HTH"}
          </div>
        </div>
      </div>

      {/* Barcode - Centered at bottom with proper spacing */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <Barcode
          value={`SPDY${trackingNumber.slice(-5)}`}
          width={1.5}
          height={35}
          fontSize={10}
          margin={0}
          textPosition="bottom"
          displayValue={true}
        />
      </div>
    </div>
  )
}

