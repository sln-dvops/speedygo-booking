"use client";

import { useEffect, useState } from "react";
import HowItWorksModal from "@/components/ordering/HowItWorks";

type BookingIntroGateProps = {
  isGuest: boolean;
};

export default function BookingIntroGate({ isGuest }: BookingIntroGateProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    if (isGuest) {
      setShowHowItWorks(true);
      return;
    }

    const hasSeenIntro = localStorage.getItem(
      "speedy_has_seen_booking_intro",
    );

    if (!hasSeenIntro) {
      setShowHowItWorks(true);
    }
  }, [isGuest]);

  const handleClose = () => {
    setShowHowItWorks(false);

    if (!isGuest) {
      localStorage.setItem("speedy_has_seen_booking_intro", "true");
    }
  };

  return (
    <HowItWorksModal
      open={showHowItWorks}
      onClose={handleClose}
      isGuest={isGuest}
    />
  );
}