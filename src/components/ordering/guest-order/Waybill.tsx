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

export function Waybill({ orderDetails }: WaybillProps) {
  const [currentWaybillIndex, setCurrentWaybillIndex] = useState(0)
  const singleWaybillRef = useRef<HTMLDivElement>(null)
  const allWaybillsRef = useRef<HTMLDivElement>(null)

  const isBulkOrder = orderDetails.isBulkOrder && orderDetails.parcels.length > 1
  const totalWaybills = isBulkOrder ? orderDetails.parcels.length : 1

  // Handle printing a single waybill - using contentRef as requested
  const handlePrintSingle = useReactToPrint({
    documentTitle: `Waybill-${orderDetails.orderNumber || ""}${isBulkOrder ? `-${currentWaybillIndex + 1}` : ""}`,
    contentRef: singleWaybillRef,
    pageStyle: `
      @page {
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .page-break-after {
          page-break-after: always;
        }
        button, .tabs, .tab-list, .print-hidden {
          display: none !important;
        }
      }
    `,
  })

  // Handle printing all waybills - using contentRef as requested
  const handlePrintAll = useReactToPrint({
    documentTitle: `Waybills-${orderDetails.orderNumber || ""}`,
    contentRef: allWaybillsRef,
    pageStyle: `
      @page {
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .page-break-after {
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
            <Button onClick={handlePrintSingle} className="bg-black hover:bg-black/90 text-yellow-400">
              <Printer className="mr-2 h-4 w-4" />
              Print Current Waybill
            </Button>

            {isBulkOrder && (
              <Button onClick={handlePrintAll} className="bg-black hover:bg-black/90 text-yellow-400">
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
          <div className="border border-gray-300 rounded-lg p-6 bg-white" ref={singleWaybillRef}>
            <WaybillContent
              orderDetails={orderDetails}
              parcel={currentParcel}
              recipient={currentRecipient}
              waybillIndex={currentWaybillIndex}
            />
          </div>

          {/* Hidden container with all waybills for bulk printing */}
          <div style={{ display: "none" }}>
            <div ref={allWaybillsRef}>
              {isBulkOrder ? (
                orderDetails.parcels.map((parcel, index) => (
                  <div key={index} className="mb-8 page-break-after">
                    <WaybillContent
                      orderDetails={orderDetails}
                      parcel={parcel}
                      recipient={orderDetails.recipients?.find((r) => r.parcelIndex === index)}
                      waybillIndex={index}
                    />
                  </div>
                ))
              ) : (
                <WaybillContent orderDetails={orderDetails} parcel={orderDetails.parcels[0]} waybillIndex={0} />
              )}
            </div>
          </div>

          {/* Print instructions */}
          <div className="bg-yellow-100 p-4 rounded-lg print-hidden">
            <h3 className="font-medium text-black mb-2">Printing Instructions:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Click the "Print {isBulkOrder ? "All Waybills" : "Waybill"}" button above</li>
              <li>Each waybill will print on a separate page</li>
              <li>Ensure your printer settings are set to A4 size</li>
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

interface WaybillContentProps {
  orderDetails: OrderWithParcels
  parcel: ParcelDimensions
  recipient?: RecipientDetails | null
  waybillIndex?: number
}

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
    <div className="space-y-6 text-black">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Speedy Xpress</h2>
          <p className="text-sm">Fast & Reliable Delivery</p>
        </div>
        <div className="text-right">
          <p className="font-bold">Waybill</p>
          <p className="text-sm">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <h3 className="font-bold border-b border-black pb-1 mb-2">From</h3>
          <p className="font-medium">{orderDetails.senderName}</p>
          <p className="text-sm">{orderDetails.senderAddress}</p>
          <p className="text-sm">Contact: {orderDetails.senderContactNumber}</p>
          <p className="text-sm">Email: {orderDetails.senderEmail}</p>
        </div>

        <div className="flex-1">
          <h3 className="font-bold border-b border-black pb-1 mb-2">To</h3>
          <p className="font-medium">{recipientName}</p>
          <p className="text-sm">{recipientAddress}</p>
          <p className="text-sm">Contact: {recipientContact}</p>
          <p className="text-sm">Email: {recipientEmail}</p>
        </div>
      </div>

      <div className="border-t border-b border-black py-4">
        <h3 className="font-bold mb-2">Parcel Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm">
              <span className="font-medium">Weight:</span> {parcel.weight} kg
            </p>
            <p className="text-sm">
              <span className="font-medium">Dimensions:</span> {parcel.length} × {parcel.width} × {parcel.height} cm
            </p>
            <p className="text-sm">
              <span className="font-medium">Delivery Method:</span>{" "}
              {orderDetails.deliveryMethod === "atl" ? "At the Location" : "Hand-to-Hand"}
            </p>
            {isBulkOrder && (
              <p className="text-sm">
                <span className="font-medium">Parcel:</span> {waybillIndex + 1} of {orderDetails.parcels.length}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end justify-center">
            <div className="flex flex-col items-center">
              <QRCode value={trackingNumber} size={100} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Barcode value={trackingNumber} width={1.5} height={50} fontSize={14} />
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Thank you for choosing Speedy Xpress!</p>
        <p>For tracking and support, visit speedyxpress.com or call 1800-SPEEDY</p>
      </div>
    </div>
  )
}

