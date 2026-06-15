"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Clock, ArrowRight } from "lucide-react";

const restaurants = [
  {
    id: "1", name: "Georgian Corner", cuisine: "Georgian", rating: 4.9,
    time: "25-35", fee: "₾3", emoji: "🥗", popular: "Khachapuri",
    tag: "Most Popular",
  },
  {
    id: "2", name: "Dragon Palace", cuisine: "Chinese", rating: 4.8,
    time: "30-45", fee: "₾4", emoji: "🥢", popular: "Dim Sum",
    tag: "Top Rated",
  },
  {
    id: "3", name: "Spice Route", cuisine: "Indian", rating: 4.7,
    time: "20-30", fee: "₾3.5", emoji: "🍛", popular: "Butter Chicken",
    tag: "Student Fav",
  },
  {
    id: "4", name: "Burger Hub", cuisine: "Fast Food", rating: 4.8,
    time: "15-25", fee: "₾2.5", emoji: "🍔", popular: "Double Smash",
    tag: "Fastest",
  },
  {
    id: "5", name: "Sakura Garden", cuisine: "Japanese", rating: 4.9,
    time: "35-50", fee: "₾5", emoji: "🍱", popular: "Ramen Bowl",
    tag: "Premium",
  },
  {
    id: "6", name: "Sweet Spot", cuisine: "Desserts", rating: 4.6,
    time: "20-30", fee: "₾2", emoji: "🍰", popular: "Tiramisu",
    tag: "Trending",
  },
];

const tagColors: Record<string, string> = {
  "Most Popular": "bg-primary/10 text-primary",
  "Top Rated": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  "Student Fav": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  "Fastest": "bg-accent/10 text-accent",
  "Premium": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  "Trending": "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
};

export function PopularRestaurants() {
  return (
    <section className="py-24 bg-background" id="restaurants">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
              Top Picks
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Popular Restaurants
            </h2>
          </div>
          <Link
            href="/restaurants"
            className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/restaurants/${r.id}`} className="block group">
                <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Image Placeholder */}
                  <div className="relative h-44 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 flex items-center justify-center">
                    <span className="text-7xl">{r.emoji}</span>
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${tagColors[r.tag]}`}>
                      {r.tag}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                          {r.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{r.cuisine}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {r.rating}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {r.time} min
                      </span>
                      <span>Delivery: {r.fee}</span>
                      <span className="ml-auto text-primary text-xs font-medium">Popular: {r.popular}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
