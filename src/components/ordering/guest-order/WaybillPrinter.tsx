"use client"

import { Package } from "lucide-react"
import QRCode from "react-qr-code"
import Barcode from "react-barcode"
import type { OrderWithParcels, RecipientDetails } from "@/types/order"
import type { ParcelDimensions } from "@/types/pricing"

interface WaybillPrinterProps {
  orderDetails: OrderWithParcels
  parcel: ParcelDimensions & { pricingTier?: string }
  recipient?: RecipientDetails | null | undefined
  waybillIndex: number
}

// This component contains ONLY the content to be printed
export function WaybillPrinter({ orderDetails, parcel, recipient, waybillIndex }: WaybillPrinterProps) {
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
    <div
      className="waybill-content"
      style={{
        width: "100mm",
        height: "150mm",
        padding: "4mm",
        margin: "0",
        boxSizing: "border-box",
        backgroundColor: "white",
        position: "relative",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3 w-full">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <span className="text-lg font-bold">SPEEDY XPRESS</span>
        </div>
        <span className="text-3xl font-bold">{pricingTier}</span>
      </div>

      {/* Seller Info */}
      <div className="mb-3 w-full">
        <div className="bg-black text-white px-2 py-1 text-xs font-bold w-full">Seller info</div>
        <div className="p-2 text-sm w-full" style={{ border: "1px solid black", borderTop: "none" }}>
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
      <div className="mb-3 w-full">
        <div className="bg-black text-white px-2 py-1 text-xs font-bold w-full">Buyer info</div>
        <div className="p-2 text-sm w-full" style={{ border: "1px solid black", borderTop: "none" }}>
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
      <div className="mb-3 w-full">
        <table className="w-full table-fixed" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                className="px-2 py-1 text-left text-xs font-bold bg-black text-white w-4/5"
                style={{ border: "1px solid black" }}
              >
                ITEM
              </th>
              <th
                className="px-2 py-1 text-center w-1/5 text-xs font-bold bg-black text-white"
                style={{ border: "1px solid black" }}
              >
                QTY
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-2" style={{ border: "1px solid black" }}>
                {parcel.weight}kg • {parcel.length}×{parcel.width}×{parcel.height}cm
              </td>
              <td className="px-2 py-2 text-center" style={{ border: "1px solid black" }}>
                1
              </td>
            </tr>
            <tr>
              <td className="px-2 py-2" style={{ border: "1px solid black" }}>
                {orderDetails.deliveryMethod === "atl" ? "ATL Delivery" : "Hand-to-Hand Delivery"}
              </td>
              <td className="px-2 py-2 text-center" style={{ border: "1px solid black" }}>
                -
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* QR Code and Delivery Type Indicator side by side */}
      <div className="flex justify-between items-center mt-4 w-full">
        <div>
          <QRCode value={trackingNumber} size={85} style={{ height: "auto", maxWidth: "100%", width: "85px" }} />
        </div>
        <div className="text-right">
          <div className="text-8xl font-black" style={{ lineHeight: "0.9" }}>
            {orderDetails.deliveryMethod === "atl" ? "ATL" : "HTH"}
          </div>
        </div>
      </div>

      {/* Barcode - Centered at bottom with proper spacing */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center w-full">
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

