import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { ParcelDeliveryForm } from "@/components/parcel/ParcelDeliveryForm";

export const metadata: Metadata = {
  title: "Parcel Delivery",
  description: "Send and receive parcels with door-to-door delivery in Georgia.",
};

export default function ParcelPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <ParcelDeliveryForm />
      </main>
    </>
  );
}
