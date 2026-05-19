"use client";

import { X, Package, MapPin, CreditCard, Search } from "lucide-react";

type HowItWorksModalProps = {
  open: boolean;
  onClose: () => void;
  isGuest?: boolean;
};

export default function HowItWorksModal({
  open,
  onClose,
  isGuest = true,
}: HowItWorksModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close how it works"
        >
          <X size={20} />
        </button>

        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-yellow-400">
            How it works
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Book your delivery in a few simple steps
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isGuest
              ? "You are booking as a guest. Please save your tracking ID after payment so you can track your parcel later."
              : "Your order will be saved to your account, so you can view and track it again later."}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-black-400">
              <Package size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                1. Choose your order type
              </h3>
              <p className="text-sm text-slate-600">
                Select single parcel or multiple parcels depending on your delivery needs.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-black-700">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                2. Enter delivery details
              </h3>
              <p className="text-sm text-slate-600">
                Fill in sender details, recipient details, parcel information, and any special instructions.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-black-700">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                3. Confirm and pay
              </h3>
              <p className="text-sm text-slate-600">
                Review your order before proceeding to secure online payment.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-black-700">
              <Search size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                4. Track your parcel
              </h3>
              <p className="text-sm text-slate-600">
                Use your tracking ID to check the delivery status after the order is created.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm text-black transition hover:bg-yellow-500 cursor-pointer "
        >
          Got it, start booking
        </button>
      </div>
    </div>
  );
}