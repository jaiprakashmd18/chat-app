"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, Phone, ChevronDown, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/useToast";
import { cn, isRestaurantOpen } from "@/lib/utils";

interface MenuItem { id: string; name: string; description: string; price: number; images: string[]; isVeg: boolean; isPopular: boolean; categoryId?: string; }
interface Category { id: string; name: string; description?: string; }
interface Restaurant {
  id: string; name: string; description: string; cuisine: string[]; images: string[]; phone?: string;
  address: string; city: string; deliveryFee: number; estimatedTime: number; rating: number;
  reviewCount: number; isOpen: boolean; openingTime: string; closingTime: string;
  minOrderAmount: number; categories: Category[]; menuItems: MenuItem[];
  reviews: Array<{ id: string; rating: number; comment?: string; user: { name: string; image?: string }; createdAt: string }>;
}

export function RestaurantDetail({ restaurantId }: { restaurantId: string }) {
  const { toast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setRestaurant(d.data);
          if (d.data.categories[0]) setActiveCategory(d.data.categories[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    const qty = quantities[item.id] || 1;
    addItem(
      { id: `${item.id}-${Date.now()}`, menuItemId: item.id, name: item.name, price: item.price, quantity: qty },
      restaurant.id,
      restaurant.name
    );
    toast({ title: `${item.name} added to cart 🛒` });
    setQuantities((q) => ({ ...q, [item.id]: 1 }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 max-w-5xl py-8">
        <div className="h-64 bg-muted rounded-2xl animate-pulse mb-6" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 text-center py-20">
        <p className="font-semibold text-lg">Restaurant not found</p>
      </div>
    );
  }

  const filteredItems = activeCategory
    ? restaurant.menuItems.filter((i) => i.categoryId === activeCategory)
    : restaurant.menuItems;

  return (
    <div className="container mx-auto px-4 max-w-5xl py-8">
      {/* Banner */}
      <div className="relative h-56 md:h-72 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950/30 dark:to-orange-900/30 rounded-3xl flex items-center justify-center mb-6 overflow-hidden">
        <span className="text-8xl">🍽️</span>
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl">
            <span className="bg-white text-black font-bold px-6 py-2 rounded-full">Currently Closed</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">{restaurant.name}</h1>
          <p className="text-muted-foreground mb-3">{restaurant.cuisine.join(" • ")}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {restaurant.rating.toFixed(1)} ({restaurant.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {restaurant.estimatedTime} min
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {restaurant.city}
            </span>
            {restaurant.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" /> {restaurant.phone}
              </span>
            )}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-sm space-y-1.5 flex-shrink-0">
          <div className="flex justify-between gap-8">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-semibold">₾{restaurant.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-muted-foreground">Min. Order</span>
            <span className="font-semibold">₾{restaurant.minOrderAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-muted-foreground">Hours</span>
            <span className="font-semibold">{restaurant.openingTime} - {restaurant.closingTime}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Category Sidebar */}
        <div className="hidden md:block">
          <div className="sticky top-24 bg-card border border-border rounded-2xl p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Categories</p>
            {restaurant.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  activeCategory === cat.id ? "bg-primary text-white" : "hover:bg-muted"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Category Pills */}
        <div className="md:hidden col-span-full">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {restaurant.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === cat.id ? "bg-primary text-white" : "bg-card border border-border"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="md:col-span-2 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <p className="text-muted-foreground">No items in this category</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-4 flex gap-4"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  🍽️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      {item.isPopular && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Popular</span>
                      )}
                      {item.isVeg && (
                        <span className="text-xs bg-green-100 dark:bg-green-950/30 text-green-600 px-2 py-0.5 rounded-full ml-1">Veg</span>
                      )}
                    </div>
                    <p className="font-bold text-primary flex-shrink-0">₾{item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1.5 bg-muted rounded-xl">
                      <button
                        onClick={() => setQuantities((q) => ({ ...q, [item.id]: Math.max(1, (q[item.id] || 1) - 1) }))}
                        className="p-1.5 hover:text-primary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center text-sm font-medium">{quantities[item.id] || 1}</span>
                      <button
                        onClick={() => setQuantities((q) => ({ ...q, [item.id]: (q[item.id] || 1) + 1 }))}
                        className="p-1.5 hover:text-primary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!restaurant.isOpen}
                      className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 flex-1 justify-center"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
