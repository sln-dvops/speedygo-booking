"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phoneNumber = "6583698386"; // Singapore number, no + sign
  const message = encodeURIComponent(
    "Hi Speedy Xpress, I need help with my booking."
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg transition hover:bg-green-600"
      aria-label="Chat with Speedy Xpress on WhatsApp"
    >
      <MessageCircle size={22} />
      <span className="hidden text-sm font-medium sm:inline">
        Need help?
      </span>
    </a>
  );
}