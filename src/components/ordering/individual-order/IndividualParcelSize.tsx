"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import styles from "./ParcelDimensions.module.css";

import { ParcelForm } from "@/components/ordering/shared/parcel-components/ParcelForm";
import { ParcelList } from "@/components/ordering/shared/parcel-components/ParcelList";
import { ParcelSummary } from "@/components/ordering/shared/parcel-components/ParcelSummary";

import type { ParcelDimensions as ParcelDimensionsType } from "@/types/pricing";

type ParcelDimensionsProps = {
  onPrevStep: () => void;
  onNextStep: () => void;
  selectedDimensions: ParcelDimensionsType[] | null;
  setSelectedDimensions: (dimensions: ParcelDimensionsType[]) => void;
};

export function ParcelDimensions({
  onPrevStep,
  onNextStep,
  selectedDimensions,
  setSelectedDimensions,
}: ParcelDimensionsProps) {
  const [currentParcel, setCurrentParcel] = useState<ParcelDimensionsType>({
    weight: 0,
  });

  const [parcels, setParcels] = useState<ParcelDimensionsType[]>(
    () => selectedDimensions ?? [],
  );

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleDimensionChange = (
    field: keyof ParcelDimensionsType,
    value: string,
  ) => {
    const numValue = Number.parseFloat(value) || 0;
    setCurrentParcel((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const isValidParcel = (parcel: ParcelDimensionsType) => {
    return parcel.weight > 0 && parcel.weight <= 30;
  };

  const handleAddParcel = () => {
    if (!isValidParcel(currentParcel)) return;

    // Single parcel order → exactly one parcel
    setParcels([currentParcel]);
    setEditingIndex(null);

    setCurrentParcel({ weight: 0 });
  };

  const handleEditParcel = (index: number) => {
    setCurrentParcel(parcels[index]);
    setEditingIndex(index);
  };

  const handleRemoveParcel = () => {
    setParcels([]);
    setEditingIndex(null);
    setCurrentParcel({ weight: 0 });
  };

  const calculateTotalWeight = () =>
    parcels.reduce((total, parcel) => total + parcel.weight, 0);

  const handleContinue = () => {
    if (parcels.length === 1) {
      setSelectedDimensions(parcels);
      onNextStep();
    }
  };

  return (
    <Card className={styles.container}>
      <CardHeader className={styles.header}>
        <CardTitle className={styles.title}>Single Parcel Details</CardTitle>

        <div className={styles.badges}>
          <Badge className={styles.orderTypeBadge}>Single Parcel</Badge>

          {parcels.length === 1 && (
            <Badge className={styles.statusBadge}>Parcel Added</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className={styles.infoBox}>
          <h3 className={styles.infoTitle}>Single Parcel Information</h3>
          <p className={styles.infoText}>
            Please provide the weight of your parcel. Pricing is calculated
            based on the weight.
          </p>
        </div>

        {(parcels.length === 0 || editingIndex !== null) && (
          <ParcelForm
            currentParcel={currentParcel}
            handleDimensionChange={handleDimensionChange}
            handleAddParcel={handleAddParcel}
            editingIndex={editingIndex}
          />
        )}

        {parcels.length === 1 && (
          <ParcelList
            parcels={parcels}
            handleEditParcel={handleEditParcel}
            handleRemoveParcel={handleRemoveParcel}
          />
        )}

        {parcels.length === 1 && (
          <ParcelSummary
            parcels={parcels}
            calculateTotalWeight={calculateTotalWeight}
          />
        )}
      </CardContent>

      <CardFooter className={styles.footer}>
        <Button
          variant="outline"
          onClick={onPrevStep}
          className={styles.backButton}
        >
          Back
        </Button>

        <Button
          onClick={handleContinue}
          className={styles.nextButton}
          disabled={parcels.length !== 1}
        >
          Continue to Delivery Method
        </Button>
      </CardFooter>
    </Card>
  );
}
