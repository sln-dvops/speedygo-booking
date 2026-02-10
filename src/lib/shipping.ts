import QRCode from "qrcode"
import { Waybill } from "@/components/ordering/guest-order/Waybill"

export async function createDetrackJob(orderDetails: any) {
  const response = await fetch("https://app.detrack.com/api/v2/dn/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.DETRACK_API_KEY || "",
    },
    body: JSON.stringify({
      // Map orderDetails to Detrack's expected format
      do_number: orderDetails.orderId,
      date: new Date().toISOString().split("T")[0],
      address: orderDetails.recipientAddress,
      // Add other required fields
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create Detrack job")
  }

  const data = await response.json()
  return data.data.id // Return the Detrack job ID
}

export async function generateWaybill(detrackId: string, orderDetails: any) {
  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(detrackId)

  // Generate waybill using the Waybill component
  const waybillHtml = Waybill({
    orderNumber: detrackId,
    senderName: orderDetails.senderName,
    senderAddress: orderDetails.senderAddress,
    recipientName: orderDetails.recipientName,
    recipientAddress: orderDetails.recipientAddress,
    parcelSize: orderDetails.parcelSize,
    collectionMethod: orderDetails.collectionMethod,
    qrCode: qrCodeDataUrl,
  })

  // Convert waybill HTML to PDF (you may need to use a library like puppeteer for this)
  // const pdfBuffer = await convertHtmlToPdf(waybillHtml)

  // Save the PDF to your storage system or send it to the user
  // await savePdfToStorage(pdfBuffer, detrackId)
}

