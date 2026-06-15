import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { OrderTracking } from "@/components/orders/OrderTracking";

export const metadata: Metadata = { title: "Order Tracking" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <OrderTracking orderId={id} />
      </main>
    </>
  );
}
