import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { RestaurantList } from "@/components/restaurants/RestaurantList";

export const metadata: Metadata = {
  title: "Restaurants",
  description: "Browse 500+ restaurants and order food for delivery in Georgia.",
};

export default function RestaurantsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <RestaurantList />
      </main>
    </>
  );
}
