import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { RestaurantDetail } from "@/components/restaurants/RestaurantDetail";

export const metadata: Metadata = { title: "Restaurant" };

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <RestaurantDetail restaurantId={id} />
      </main>
    </>
  );
}
