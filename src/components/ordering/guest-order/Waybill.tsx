import Image from "next/image"
import Barcode from "react-barcode"
import type { DeliveryMethod } from "@/types/pricing"

type WaybillProps = {
  orderNumber: string
  senderName: string
  senderAddress: string
  recipientName: string
  recipientAddress: string
  parcelSize: string
  deliveryMethod: DeliveryMethod | null
  qrCode: string
}

export function Waybill({
  orderNumber,
  senderName,
  senderAddress,
  recipientName,
  recipientAddress,
  parcelSize,
  deliveryMethod,
  qrCode,
}: WaybillProps) {
  return (
    <div className="w-[150mm] h-[100mm] bg-white border border-black p-4 text-xs">
      <div className="flex justify-between items-start mb-4">
        <Image src="/logo.png" alt="Speedy Xpress Logo" width={100} height={40} />
        <div className="text-right">
          <h2 className="font-bold text-lg">Waybill</h2>
          <p>Order #: {orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-bold">From:</h3>
          <p>{senderName}</p>
          <p>{senderAddress}</p>
        </div>
        <div>
          <h3 className="font-bold">To:</h3>
          <p>{recipientName}</p>
          <p>{recipientAddress}</p>
        </div>
      </div>

      <div className="mb-4">
        <p>
          <strong>Parcel Size:</strong> {parcelSize}
        </p>
        <p>
          <strong>Delivery Method:</strong> {deliveryMethod || "Not specified"}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Barcode value={orderNumber} width={1.5} height={40} fontSize={12} />
        <Image src={qrCode || "/placeholder.svg"} alt="QR Code" width={80} height={80} />
      </div>
    </div>
  )
}

