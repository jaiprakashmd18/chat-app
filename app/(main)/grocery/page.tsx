import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "Grocery Delivery",
  description: "Get groceries and essentials delivered to your door in Georgia.",
};

export default function GroceryPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 max-w-3xl py-20 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="font-display text-3xl font-bold mb-4">Grocery Delivery</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Get groceries, snacks, and daily essentials delivered right to your dorm or apartment.
            Browse our partner stores and get everything you need in 30-60 minutes.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { emoji: "🥦", name: "Fresh Produce", count: "200+ items" },
              { emoji: "🥛", name: "Dairy & Eggs", count: "50+ items" },
              { emoji: "🍞", name: "Bakery", count: "80+ items" },
              { emoji: "🧴", name: "Toiletries", count: "150+ items" },
              { emoji: "🍫", name: "Snacks", count: "300+ items" },
              { emoji: "🥤", name: "Beverages", count: "100+ items" },
            ].map((cat) => (
              <div key={cat.name} className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5">
                <span className="text-3xl block mb-2">{cat.emoji}</span>
                <p className="font-medium text-sm">{cat.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{cat.count}</p>
              </div>
            ))}
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
            <p className="font-semibold text-primary mb-1">🚀 Coming Soon!</p>
            <p className="text-muted-foreground text-sm">
              Full grocery delivery is launching soon. Register now to be first in line for exclusive launch discounts!
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
