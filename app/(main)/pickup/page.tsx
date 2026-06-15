import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { PersonalPickupForm } from "@/components/pickup/PersonalPickupForm";

export const metadata: Metadata = {
  title: "Personal Pickup",
  description: "Request a personal pickup from any restaurant not listed on StudentExpress.",
};

export default function PickupPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <PersonalPickupForm />
      </main>
    </>
  );
}
