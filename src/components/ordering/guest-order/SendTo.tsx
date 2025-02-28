"use client"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SendToProps = {
  onPrevStep: () => void
  onNextStep: () => void
}

export function SendTo({ onPrevStep, onNextStep }: SendToProps) {
  return (
    <Card className="w-full bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">Send to</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Name of recipient */}
          <div>
            <Label htmlFor="recipientName" className="text-base mb-2 flex items-center text-black">
              <span className="text-black mr-1">*</span> Name of recipient
            </Label>
            <Input id="recipientName" placeholder="Name of recipient" className="border-black" />
          </div>

          {/* Contact number */}
          <div>
            <Label htmlFor="recipientContact" className="text-base mb-2 flex items-center text-black">
              <span className="text-black mr-1">*</span> Contact number
            </Label>
            <div className="flex h-[42px]">
              <div className="border border-black rounded-l-md px-2 flex items-center bg-yellow-100 h-full">
                <Image src="/icons/sg-flag-rect.svg" alt="Singapore flag" width={30} height={20} className="mr-1" />
                <span className="text-sm text-black">+65</span>
              </div>
              <Input
                id="recipientContact"
                placeholder="Contact number"
                className="rounded-l-none border-black h-full"
              />
            </div>
          </div>

          {/* Email address */}
          <div>
            <Label htmlFor="recipientEmail" className="text-base mb-2 flex items-center text-black">
              <span className="text-black mr-1">*</span> Email address
            </Label>
            <Input id="recipientEmail" type="email" placeholder="Email address" className="border-black" />
          </div>

          {/* Street name, building */}
          <div>
            <Label htmlFor="recipientStreet" className="text-base mb-2 flex items-center text-black">
              <span className="text-black mr-1">*</span> Street name, building
            </Label>
            <Input id="recipientStreet" placeholder="Street name, building" className="border-black" />
          </div>

          {/* Unit no. */}
          <div>
            <Label htmlFor="recipientUnitNo" className="text-base mb-2 flex items-center text-black">
              <span className="text-black mr-1">*</span> Unit no.
            </Label>
            <Input id="recipientUnitNo" placeholder="Unit no." className="border-black" />
          </div>

          {/* Postal code */}
          <div>
            <Label htmlFor="recipientPostalCode" className="text-base mb-2 flex items-center text-black">
              <span className="text-black mr-1">*</span> Postal code
            </Label>
            <Input id="recipientPostalCode" placeholder="Postal code" className="border-black" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onPrevStep} className="border-black text-black hover:bg-yellow-100">
          Back
        </Button>
        <Button onClick={onNextStep} className="bg-black hover:bg-black/90 text-yellow-400">
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}

