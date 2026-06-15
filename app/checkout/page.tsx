import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <CheckoutForm />
      </main>
    </>
  );
}
