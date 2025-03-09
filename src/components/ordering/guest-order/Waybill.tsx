"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { format } from "date-fns"
import { Printer, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { OrderWithParcels } from "@/types/order"

interface WaybillProps {
  orderDetails: OrderWithParcels
}

export function Waybill({ orderDetails }: WaybillProps) {
  const waybillRef = useRef<HTMLDivElement>(null)

  // Set up the print handler correctly
  const handlePrint = useReactToPrint({
    documentTitle: `Waybill-${orderDetails.orderNumber}`,
    contentRef: waybillRef,
    pageStyle: `
      @page {
        size: 150mm 100mm landscape;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .waybill-content {
          transform: none !important;
          width: 150mm !important;
          height: 100mm !important;
        }
      }
    `,
  })

  // Format the date for display
  const formattedDate = format(new Date(), "dd MMM yyyy")

  // Generate a tracking number based on the order ID
  const trackingNumber = `SX${orderDetails.orderNumber?.substring(0, 8).toUpperCase() || ""}SG`

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button className="bg-black hover:bg-black/90 text-yellow-400" onClick={() => handlePrint()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Waybill
        </Button>
      </div>

      {/* Preview container with proper sizing */}
      <div className="border border-gray-300 rounded-md p-6 bg-gray-100">
        <div className="text-sm text-gray-500 mb-4">Waybill Preview (will print at 150mm &times; 100mm):</div>

        {/* Completely different approach using aspect ratio and no scaling */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            {/* Actual waybill that will be printed */}
            <div
              ref={waybillRef}
              className="bg-white waybill-content border-2 border-black rounded-md p-4 mx-auto"
              style={{
                width: "100%",
                aspectRatio: "1.5 / 1", // 150mm × 100mm aspect ratio
                maxHeight: "600px",
                overflow: "visible",
              }}
            >
              {/* Main waybill content */}
              <div className="flex h-full">
                {/* Left column - QR code */}
                <div className="w-1/4 flex flex-col items-center justify-center border-r border-black pr-2">
                  <div className="border border-black p-2 rounded-md flex flex-col items-center justify-center mb-2">
                    <QrCode className="h-16 w-16 text-black" />
                    <p className="text-xs text-center mt-1 text-black font-medium">{trackingNumber}</p>
                  </div>
                  <div className="text-center">
                    <h2 className="text-base font-bold text-black">SPEEDY XPRESS</h2>
                    <p className="text-xs text-gray-600">Fast &amp; Reliable Delivery</p>
                  </div>
                </div>

                {/* Right column - Main content */}
                <div className="w-3/4 pl-2 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-black pb-1 mb-1">
                    <div>
                      <Badge className="bg-black text-yellow-400 text-xs">
                        {orderDetails.deliveryMethod === "atl" ? "Authorized to Leave" : "Hand to Hand Delivery"}
                      </Badge>

                      {orderDetails.isBulkOrder && (
                        <Badge className="ml-1 bg-yellow-400 text-black border border-black text-xs">
                          Bulk ({orderDetails.totalParcels})
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Date: {formattedDate}</p>
                      <p className="text-xs text-gray-600">Order #: {orderDetails.orderNumber}</p>
                    </div>
                  </div>

                  {/* Sender & Recipient */}
                  <div className="grid grid-cols-2 gap-2 mb-1">
                    <div className="border border-black p-1 rounded-md">
                      <h3 className="font-bold text-black uppercase text-xs">FROM:</h3>
                      <p className="font-bold text-black text-xs">{orderDetails.senderName}</p>
                      <p className="text-xs text-gray-600 leading-tight">{orderDetails.senderAddress}</p>
                      <p className="text-xs text-gray-600 leading-tight">Contact: {orderDetails.senderContactNumber}</p>
                    </div>

                    <div className="border border-black p-1 rounded-md">
                      <h3 className="font-bold text-black uppercase text-xs">TO:</h3>
                      <p className="font-bold text-black text-xs">{orderDetails.recipientName}</p>
                      <p className="text-xs text-gray-600 leading-tight">{orderDetails.recipientAddress}</p>
                      <p className="text-xs text-gray-600 leading-tight">
                        Contact: {orderDetails.recipientContactNumber}
                      </p>
                    </div>
                  </div>

                  {/* Parcel Details */}
                  <div className="flex-grow">
                    <h3 className="font-bold text-black uppercase text-xs mb-1">PARCEL DETAILS:</h3>

                    <div className="border border-black rounded-md overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-1 px-1 text-left border-b border-black">#</th>
                            <th className="py-1 px-1 text-left border-b border-black">Weight</th>
                            <th className="py-1 px-1 text-left border-b border-black">
                              Dimensions (L&times;W&times;H)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.parcels.slice(0, 3).map((parcel, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="py-0.5 px-1 border-b border-gray-200">{index + 1}</td>
                              <td className="py-0.5 px-1 border-b border-gray-200">{parcel.weight} kg</td>
                              <td className="py-0.5 px-1 border-b border-gray-200">
                                {parcel.length} &times; {parcel.width} &times; {parcel.height} cm
                              </td>
                            </tr>
                          ))}
                          {orderDetails.parcels.length > 3 && (
                            <tr>
                              <td colSpan={3} className="py-0.5 px-1 text-center">
                                + {orderDetails.parcels.length - 3} more parcels
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-1 border-t border-black pt-1">
                    <p className="text-xs text-gray-600 leading-tight">Please attach this waybill to your parcel</p>
                    <p className="text-xs font-bold text-black">Thank you for choosing Speedy Xpress!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional instructions */}
      <div className="bg-yellow-100 p-6 rounded-md border border-yellow-300">
        <h3 className="font-medium text-black mb-4">Printing Instructions:</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Click the &ldquo;Print Waybill&rdquo; button above to print</li>
          <li>Ensure your printer is set to print at actual size (100%)</li>
          <li>The waybill will print at exactly 150mm &times; 100mm</li>
          <li>Use adhesive paper if available for easy attachment to your parcel</li>
        </ul>
      </div>
    </div>
  )
}

