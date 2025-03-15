"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TermsAndConditions() {
  return (
    <Dialog>
      <DialogTrigger className="text-sm text-blue-600 hover:underline">terms and conditions</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black mb-4">
            Important Information Before Scheduling Your Parcel Collection and Delivery
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <p className="text-gray-600">
              Please review the following details carefully before proceeding with your parcel collection and delivery
              request:
            </p>

            <section>
              <h3 className="font-bold text-black mb-2">Collection Schedule:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Days: Monday to Saturday</li>
                <li>Time: 8:00 AM to 9:00 PM</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-black mb-2">Delivery Schedule:</h3>
              <p className="text-gray-600">
                Parcels will be delivered within 3 days from collection, or as soon as possible once ready. We strive to
                deliver all parcels on the next working day after collection.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-black mb-2">Size and Weight Limitations:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Maximum Weight: 30kg per parcel.</li>
                <li>Maximum Dimensions: Each side of the parcel must not exceed 150cm.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-black mb-2">Insurance:</h3>
              <p className="text-gray-600">
                Your parcel will be insured for up to $150 for damages or loss during transit. Any value exceeding this
                amount will not be covered under our insurance policy.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-black mb-2">Delivery Instructions:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <strong>Hand-to-Hand Service:</strong> If you require the parcel to be handed directly to a person,
                  please select the Hand-to-Hand Service option. Without this selection, the parcel will be delivered to
                  a safe location (e.g., doorstep).
                </li>
                <li>
                  <strong>Default Delivery:</strong> If you do not choose Hand-to-Hand Service, parcels will be left at
                  the designated delivery address.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-black mb-2">Address Information:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  You will be prompted to provide your collection and delivery addresses during the booking process.
                </li>
                <li>
                  <strong>Important:</strong> We will not be responsible for any issues that arise due to the wrong
                  provision of address or contact details. Please double-check all information before submitting.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-black mb-2">Refund Policy:</h3>
              <p className="text-gray-600">
                If a refund is necessary, it will only be issued at the end of the month. You will be notified via email
                when the refund is processed.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-black mb-2">Undelivered Parcels:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  If we are unable to deliver a parcel to the recipient, the parcel will be kept in our warehouse for
                  the seller to collect.
                </li>
                <li>
                  Should the seller require the parcel to be delivered to them, an additional delivery fee will be
                  required.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-black mb-2">Fragile Items:</h3>
              <p className="text-gray-600">
                Fragile items must be clearly marked with a fragile sticker. Failure to indicate a fragile parcel might
                cause ineligibility for a refund.
              </p>
            </section>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <p className="text-sm text-gray-500">
                For any questions or assistance, please contact us at:{" "}
                <a href="mailto:support@speedyxpress.com" className="text-blue-600 hover:underline">
                  support@speedyxpress.com
                </a>
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

