"use client";

import Image from "next/image";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import type { OrderWithParcels, RecipientDetails } from "@/types/order";
import type { ParcelDimensions } from "@/types/pricing";
interface WaybillContentProps {
  orderDetails: OrderWithParcels;
  parcel: ParcelDimensions & {
    pricingTier?: string;
    short_id?: string;
    id?: string;
  };
  recipient?: RecipientDetails | null | undefined;
  waybillIndex?: number;
}

// This component contains ONLY the content to be printed
export function WaybillContent({
  orderDetails,
  parcel,
  recipient,
}: WaybillContentProps) {
  // For bulk orders, use the recipient details if available
  const recipientName = recipient ? recipient.name : orderDetails.recipientName;
  const recipientAddress = recipient
    ? `${recipient.line1}, ${recipient.line2 || ""}, Singapore ${recipient.postalCode}`
    : orderDetails.recipientAddress;
  const recipientContact = recipient
    ? recipient.contactNumber
    : orderDetails.recipientContactNumber;

  const recipientMemo= recipient
  ?recipient.memo
  :orderDetails.recipientMemo;

  // Change the trackingNumber generation to use parcel.short_id instead of orderDetails.shortId
  const trackingNumber =
    parcel.short_id ||
    parcel.id?.slice(-12) ||
    orderDetails.shortId ||
    orderDetails.orderNumber.slice(-12);

  // Get the pricing tier from the parcel or recipient
  const pricingTier = parcel.pricingTier || recipient?.pricingTier || "T1";
  // Get postal code
const postalCode = recipient?.postalCode || orderDetails.recipientPostalCode || "";

// First 2 digits of postal code
const postalPrefix = postalCode.slice(0, 2);

// Parcel weight
const parcelWeight = parcel.weight || 0;

  return (
    <div className="waybill-content">
      {/* First Row: Logo and QR Code */}
      <table>
        <tbody>
          <tr>
            <td className="w-1-2">
              <div
                style={{ width: "200px", height: "90px", position: "relative" }}
              >
                <Image
                  src="/images/bwlogo.png"
                  alt="SpeedyXpress Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                  sizes="(max-width: 768px) 150px, 200px" // Adjust the image size based on the viewport width
                />
              </div>
            </td>
            <td className="w-1-2 text-center">
              <QRCode
                value="https://www.speedyxpress.co/"
                size={85}
                style={{
                  height: "auto",
                  maxWidth: "100%",
                  width: "65px",
                  margin: "0 auto",
                }}
              />
              <div className="text-xs mt-2 " style={{ textAlign: "center" }}>
                Contact us!
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Second Row: Delivery Method */}
      <table>
        <tbody>
          <tr className="table-header">
            <td colSpan={2}>
              {orderDetails.deliveryMethod === "standard"
                ? "Standard Delivery"
                : "Next-Day Delivery"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Postal Sector + Weight */}
<table className="waybill-table sector-weight">
  <tbody>
    <tr>
      <td>{postalPrefix}</td>
      <td>{parcelWeight} KG</td>
    </tr>
  </tbody>
</table>

      {/* Third Row: Recipient Info */}
      <table className="waybill-table">
        <tbody>
          <tr className="table-header">
            <td colSpan={2}>Recipient Info</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <div className="text-xs">
                <span className="label-bold">Name: </span> {recipientName}
                <br />
                <span className="label-bold">Address: </span> {recipientAddress}
                <br />
                <span className="label-bold">HP: </span> {recipientContact}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Fourth Row: Sender Info */}
      <table className="waybill-table">
        <tbody>
          <tr className="table-header">
            <td colSpan={2}>Sender Info</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <div className="text-xs">
                <span className="label-bold">Name: </span>{" "}
                {orderDetails.senderName}
                <br />
                <span className="label-bold">HP: </span>{" "}
                {orderDetails.senderContactNumber}
                {recipientMemo?.trim() && (
            <>
              <br />
              <span className="label-bold">Memo: </span> {recipientMemo}
            </>
          )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Final Row: Barcode and Contact QR */}
      <table>
        <tbody>
          <tr>
            <td className="w-1-2">
              <Barcode
                value={trackingNumber}
                width={1.5}
                height={40}
                fontSize={12}
                margin={0}
                textPosition="bottom"
                displayValue={true}
              />
            </td>
            <td className="w-1-2 text-right">
              <QRCode
                value={trackingNumber}
                size={85}
                style={{
                  height: "auto",
                  maxWidth: "100%",
                  width: "65px",
                  margin: "0 auto",
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
