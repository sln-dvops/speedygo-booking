"use client";

import { Check } from "lucide-react";

type OrderProgressIndicatorProps = {
  currentStep: number;
  steps: string[];
};

export function OrderProgressIndicator({
  currentStep,
  steps,
}: OrderProgressIndicatorProps) {
  const progressPercentage =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Mobile compact view */}
      <div className="mb-3 flex items-center justify-between md:hidden">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-yellow-400">
            Booking Progress
          </p>
          <h3 className="text-sm font-semibold text-gray-900">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </h3>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100 md:hidden">
        <div
          className="h-full rounded-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Desktop stepper */}
      <div className="hidden md:block">
        <div className="relative flex items-start justify-between">
          {/* Background line */}
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />

          {/* Active line */}
          <div
            className="absolute left-0 top-5 h-0.5 bg-yellow-400 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />

          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={step}
                className="relative z-10 flex w-full flex-col items-center text-center"
              >
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    isCompleted
                      ? "border-yellow-400 bg-yellow-400 text-white"
                      : isActive
                        ? "border-yellow-400 bg-white text-yellow-400"
                        : "border-gray-300 bg-white text-gray-400",
                  ].join(" ")}
                >
                  {isCompleted ? <Check size={18} /> : index + 1}
                </div>

                <p
                  className={[
                    "mt-2 max-w-[110px] text-xs font-medium",
                    isActive
                      ? "text-yellow-700"
                      : isCompleted
                        ? "text-gray-900"
                        : "text-gray-400",
                  ].join(" ")}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}