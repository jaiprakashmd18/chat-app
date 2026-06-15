"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, Clock, ChevronDown } from "lucide-react";
import { cn, debounce } from "@/lib/utils";

interface Restaurant {
  id: string; name: string; description: string; cuisine: string[];
  images: string[]; deliveryFee: number; estimatedTime: number;
  rating: number; reviewCount: number; isOpen: boolean; featured: boolean; tags: string[];
}

const cuisines = ["All", "Georgian", "Indian", "Chinese", "Japanese", "Fast Food", "Desserts", "Beverages"];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Top Rated" },
  { value: "time", label: "Fastest" },
  { value: "fee", label: "Lowest Fee" },
];

const CUISINE_EMOJIS: Record<string, string> = {
  Georgian: "🥗", Indian: "🍛", Chinese: "🥢", Japanese: "🍱",
  "Fast Food": "🍔", Desserts: "🍰", Beverages: "☕", All: "🍽️",
};

export function RestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const fetchRestaurants = useCallback(async (q: string, c: string, s: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: q, cuisine: c === "All" ? "" : c, sort: s, page: p.toString(), limit: "12",
      });
      const res = await fetch(`/api/restaurants?${params}`);
      const data = await res.json();
      if (data.data) {
        setRestaurants(p === 1 ? data.data : (prev) => [...prev, ...data.data]);
        setTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(debounce((q: string) => {
    setPage(1);
    fetchRestaurants(q, cuisine, sort, 1);
  }, 400), [cuisine, sort, fetchRestaurants]);

  useEffect(() => {
    fetchRestaurants("", "All", "featured", 1);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleCuisine = (c: string) => {
    setCuisine(c);
    setPage(1);
    fetchRestaurants(search, c, sort, 1);
  };

  const handleSort = (s: string) => {
    setSort(s);
    setPage(1);
    fetchRestaurants(search, cuisine, s, 1);
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Restaurants</h1>
        <p className="text-muted-foreground">
          {total > 0 ? `${total} restaurants available` : "Finding restaurants near you..."}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search restaurants, cuisine..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Cuisine Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
        {cuisines.map((c) => (
          <button
            key={c}
            onClick={() => handleCuisine(c)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              cuisine === c
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "bg-card border border-border hover:border-primary hover:text-primary"
            )}
          >
            <span>{CUISINE_EMOJIS[c] || "🍽️"}</span>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading && restaurants.length === 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border">
              <div className="h-44 bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🍽️</p>
          <p className="font-semibold text-lg mb-2">No restaurants found</p>
          <p className="text-muted-foreground">Try different search terms or filters</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {restaurants.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 12) * 0.05 }}
              >
                <Link href={`/restaurants/${r.id}`} className="block group">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="relative h-44 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 flex items-center justify-center">
                      <span className="text-6xl">{CUISINE_EMOJIS[r.cuisine[0]] || "🍽️"}</span>
                      {!r.isOpen && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">Closed</span>
                        </div>
                      )}
                      {r.featured && (
                        <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                          {r.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-sm font-semibold flex-shrink-0 ml-2">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {r.rating.toFixed(1)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{r.cuisine.join(" • ")}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {r.estimatedTime} min
                        </span>
                        <span>₾{r.deliveryFee} delivery</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {restaurants.length < total && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchRestaurants(search, cuisine, sort, nextPage);
                }}
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-60"
              >
                {loading ? "Loading..." : `Load More (${total - restaurants.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
