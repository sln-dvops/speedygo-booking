"use client";

import { useState, useEffect } from "react";
import { Info, ChevronDown, ChevronUp, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

import styles from "./FormProgress.module.css";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type {
  DeliveryMethod as DeliveryMethodType,
  ParcelDimensions,
} from "@/types/pricing";
import {
  calculateShippingPrice,
  PRICING_TIERS,
  HAND_TO_HAND_FEE,
  getPricingTierByWeight,
} from "@/types/pricing";

type DeliveryMethodProps = {
  onPrevStep: () => void;
  onNextStep: () => void;
  selectedDimensions?: ParcelDimensions[];
  isBulkOrder?: boolean;
  totalParcels?: number;
  totalWeight?: number;
  selectedDeliveryMethod: DeliveryMethodType | undefined;
  setSelectedDeliveryMethod: (method: DeliveryMethodType) => void;
};

export function DeliveryMethod({
  onPrevStep,
  onNextStep,
  selectedDimensions = [],
  isBulkOrder = false,
  totalParcels = 1,
  selectedDeliveryMethod,
  setSelectedDeliveryMethod,
}: DeliveryMethodProps) {
  const [showDetails, setShowDetails] = useState(false);

  const calculatedTotalWeight = selectedDimensions.reduce(
    (sum, parcel) => sum + parcel.weight,
    0,
  );

  const parcelDetails = selectedDimensions.map((parcel, index) => {
    const tier = getPricingTierByWeight(parcel.weight);

    const basePrice = calculateShippingPrice(parcel, "atl");
    const locationSurcharge = 0;

    const handToHandFee =
      selectedDeliveryMethod === "hand-to-hand" ? HAND_TO_HAND_FEE : 0;

    return {
      parcelNumber: index + 1,
      weight: parcel.weight,
      pricingTier: tier.name,
      basePrice,
      locationSurcharge,
      handToHandFee,
      totalPrice: basePrice + locationSurcharge + handToHandFee,
    };
  });

  const totalBasePrice = parcelDetails.reduce((sum, p) => sum + p.basePrice, 0);
  const totalLocationSurcharge = parcelDetails.reduce(
    (sum, p) => sum + p.locationSurcharge,
    0,
  );

  const totalHandToHandFee =
    selectedDeliveryMethod === "hand-to-hand"
      ? HAND_TO_HAND_FEE * parcelDetails.length
      : 0;

  const finalPrice =
    totalBasePrice + totalLocationSurcharge + totalHandToHandFee;

  if (selectedDimensions.length === 0) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            No parcel dimensions selected. Please go back and add parcel
            details.
          </p>
        </CardContent>
        <CardFooter className="px-6 py-4">
          <Button
            variant="outline"
            onClick={onPrevStep}
            className="border-black text-black hover:bg-yellow-100"
          >
            Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={`${styles.card} bg-white shadow-lg`}>
      <CardHeader>
        <CardTitle className={`text-2xl text-black ${styles.title}`}>
          Delivery Method
        </CardTitle>
        {isBulkOrder && (
          <Badge
            variant="outline"
            className="bg-yellow-200 text-black border-black mt-2"
          >
            Bulk Order ({totalParcels} Parcels)
          </Badge>
        )}
      </CardHeader>
      <CardContent className="">
        <div>
          <h3 className="font-medium text-lg text-black mb-4">
            Choose Your Delivery Method
          </h3>
          <RadioGroup
            value={selectedDeliveryMethod || ""}
            onValueChange={(value) =>
              setSelectedDeliveryMethod(value as DeliveryMethodType)
            }
            className="grid gap-4"
          >
            <Label
              className={`${styles.methodOption} ${
                selectedDeliveryMethod === "atl" ? styles.methodSelected : ""
              }`}
            >
              <RadioGroupItem value="atl" className="sr-only" />
              <div className="method-icon">
          <img src="/images/standard.png" alt="Next Day Delivery Icon" />
        </div>
              <div className="grid grid-cols-[1fr,auto] gap-3 items-center">
                <div>
                  <p className="font-medium text-black">
                    Standard Delivery
                  </p>
                  <br></br>
                  <p className="text-sm text-black-600">
                    Your parcel will be left at a safe location
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-2 border-black bg-yellow-100 text-black font-medium whitespace-nowrap"
                >
                  Free
                </Badge>
              </div>
            </Label>

            <Label
              className={`${styles.methodOption} ${
                selectedDeliveryMethod === "hand-to-hand"
                  ? styles.methodSelected
                  : ""
              }`}
            >
              <RadioGroupItem value="hand-to-hand" className="sr-only" />
              <div className="method-icon">
          <img src="/images/nextday.png" alt="Next Day Delivery Icon" />
        </div>
        <div className="grid grid-cols-[1fr,auto] gap-3 items-center">
                
                <div>
                  <p className="font-medium text-black">Next-Day Doorstep Delivery</p>
                  <br></br>
                  <p className="text-sm text-black-600">
                    Guaranteed to get by tomorrow
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-2 border-black bg-yellow-100 text-black font-medium whitespace-nowrap"
                >
                  +${HAND_TO_HAND_FEE.toFixed(2)} per parcel
                </Badge>
              </div>
              
            </Label>
          </RadioGroup>
        </div>

        <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-lg text-black">Order Summary</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-black hover:bg-yellow-200 border-black"
            >
              {showDetails ? (
                <>
                  Hide Details <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Show Details <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-300">
              <span className="font-medium">Total Parcels:</span>
              <span className="text-lg">{selectedDimensions.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-300">
              <span className="font-medium">Total Weight:</span>
              <span className="text-lg">
                {calculatedTotalWeight.toFixed(2)} kg
              </span>
            </div>
          </div>
          {showDetails && (
            <div className="mt-6 space-y-6">
              {parcelDetails.map((detail) => (
                <Card key={detail.parcelNumber} className="bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Parcel {detail.parcelNumber}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4 text-sm">
                      {/* Weight & Tier */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">Parcel Weight:</p>
                          <p>{detail.weight.toFixed(2)} kg</p>
                        </div>
                        <div>
                          <p className="font-medium">Pricing Tier:</p>
                          <p>
                            {detail.pricingTier} ($
                            {PRICING_TIERS.find(
                              (t) => t.name === detail.pricingTier,
                            )?.price.toFixed(2)}
                            )
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.totalBox}>
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Base Price:</p>
                        <p className="text-lg">
                          ${detail.basePrice.toFixed(2)}
                        </p>
                      </div>

                      {selectedDeliveryMethod === "hand-to-hand" && (
                        <div className="flex justify-between items-center mt-1">
                          <p className="font-medium">Hand-to-Hand Fee:</p>
                          <p className="text-lg text-green-600">
                            +${detail.handToHandFee.toFixed(2)}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                        <p className="font-medium">Total Parcel Price:</p>
                        <p className="text-lg text-black">
                          ${detail.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className={styles.totalBox1}>
          <div className="flex justify-between items-center">
            <p className="text-lg text-black">Base Price:</p>
            <p className="text-lg text-black">${totalBasePrice.toFixed(2)}</p>
          </div>
          {selectedDeliveryMethod === "hand-to-hand" && (
            <div className="flex justify-between items-center mt-2">
              <p className="text-lg text-black">
                Nex-day Delivery Fee (${HAND_TO_HAND_FEE.toFixed(2)} ×{" "}
                {parcelDetails.length}) :
              </p>
              <p className="text-lg text-green-600">
                +${totalHandToHandFee.toFixed(2)}
              </p>
            </div>
          )}
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-300">
            <p className="text-lg text-black">Total Price:</p>
            <p className="text-lg text-black">${finalPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-gray-600">
            <div className="flex items-center mt-4">
              <span>Please ensure that your parcel meets our guidelines.</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto ml-1">
                    <Info className="h-4 w-4 text-black" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Parcel Guidelines</DialogTitle>
                    <DialogDescription>
                      Please ensure your parcel meets the following guidelines:
                    </DialogDescription>
                  </DialogHeader>
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                    <li>Maximum weight: 30kg</li>
                    <li>Maximum dimensions: 150cm x 150cm x 150cm</li>
                    <li>
                      No prohibited items (e.g., dangerous goods, perishables)
                    </li>
                    <li>Properly packaged to prevent damage during transit</li>
                    <li>
                      Clear labeling with sender and recipient information
                    </li>
                  </ul>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevStep}
          className="border-black text-black hover:bg-yellow-100"
        >
          Back
        </Button>
        <Button
          onClick={onNextStep}
          className="bg-black hover:bg-black/90 text-yellow-400"
          disabled={!selectedDeliveryMethod}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
