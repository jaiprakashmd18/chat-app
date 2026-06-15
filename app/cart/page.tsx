import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <CartView />
      </main>
    </>
  );
}
