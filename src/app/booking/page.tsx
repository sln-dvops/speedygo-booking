import type { Metadata } from "next";
import { OrderFlow } from "@/components/ordering/OrderFlow";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { logoutAction } from "@/app/actions/ordering/guest-order/logout";
import WhatsAppButton from "@/components/ordering/WhatsAppButton";
import BookingIntroGate from "@/components/ordering/BookingIntroGate";
export const metadata: Metadata = {
  title: "Speedy Xpress: Create a delivery order",
  description: "Create a one-time delivery order with Speedy Xpress",
};

export default async function OrderPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
const isGuest = !user
  return (
    <>
     
      <main className="order-page-content">
        <OrderFlow user={user} />
        <WhatsAppButton />
      </main>
    </>
  );
}
