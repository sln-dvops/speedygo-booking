"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ParcelDimensions } from "@/types/pricing";
import { getPricingTierByWeight } from "@/types/pricing";

interface ParcelFormProps {
  currentParcel: ParcelDimensions;
  handleDimensionChange: (field: keyof ParcelDimensions, value: string) => void;
  handleAddParcel: () => void;
  editingIndex: number | null;
}

export function ParcelForm({
  currentParcel,
  handleDimensionChange,
  handleAddParcel,
  editingIndex,
}: ParcelFormProps) {
  const weight = currentParcel.weight;

  const tier =
    weight && weight > 0 ? getPricingTierByWeight(weight) : null;

  const exceedsLimit = weight > 30;

  return (
    <div className="parcel-form">
      <div className="parcel-left space-y-4">
        <div>
          <Label htmlFor="weight" className="parcel-label">
            *Weight (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            value={weight || ""}
            onChange={(e) =>
              handleDimensionChange("weight", e.target.value)
            }
            min="0"
            max="30"
            step="0.1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum allowed weight: 30kg
          </p>
        </div>

        <Button
          onClick={handleAddParcel}
          disabled={!weight || weight <= 0 || exceedsLimit}
        >
          {editingIndex !== null ? "Update Parcel" : "Add Parcel"}
        </Button>

        {exceedsLimit && (
          <p className="text-sm text-red-600">
            Parcel exceeds the maximum weight limit (30kg).
          </p>
        )}

        {tier && !exceedsLimit && (
          <div className="parcel-info border rounded-md p-3 bg-gray-50">
            <p>
              <strong>Entered Weight:</strong>{" "}
              {weight.toFixed(2)} kg
            </p>
            <p>
              <strong>Pricing Tier:</strong>{" "}
              {tier.name} (${tier.price.toFixed(2)})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
