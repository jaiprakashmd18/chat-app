"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, MapPin, ShoppingBasket, Package, Calendar, Navigation, Shield, Star } from "lucide-react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Restaurant Orders",
    description: "Browse 500+ restaurants and order from your favorite places with real-time tracking.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    gradient: "from-orange-500/10 to-orange-600/5",
  },
  {
    icon: MapPin,
    title: "Personal Pickup",
    description: "Submit any restaurant, upload your order screenshot, and we'll pick it up for you.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    gradient: "from-blue-500/10 to-blue-600/5",
  },
  {
    icon: ShoppingBasket,
    title: "Grocery Delivery",
    description: "Get groceries, snacks and essentials delivered to your dorm or apartment.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    gradient: "from-green-500/10 to-green-600/5",
  },
  {
    icon: Package,
    title: "Parcel Delivery",
    description: "Send or receive parcels with door-to-door delivery anywhere in the city.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    gradient: "from-purple-500/10 to-purple-600/5",
  },
  {
    icon: Calendar,
    title: "Schedule Orders",
    description: "Plan ahead and schedule your deliveries for the exact time you need them.",
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    gradient: "from-yellow-500/10 to-yellow-600/5",
  },
  {
    icon: Navigation,
    title: "Live Tracking",
    description: "Track your delivery in real-time on a map with live status updates.",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    gradient: "from-red-500/10 to-red-600/5",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Multiple payment options — cash, card, bank transfer, or in-app wallet.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    gradient: "from-indigo-500/10 to-indigo-600/5",
  },
  {
    icon: Star,
    title: "Loyalty Rewards",
    description: "Earn points on every order, get cashback, and unlock exclusive student deals.",
    color: "text-accent",
    bg: "bg-green-50 dark:bg-green-950/30",
    gradient: "from-accent/10 to-accent/5",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background" id="features">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Everything You Need
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            One App, All Deliveries
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            StudentExpress Georgia is the ultimate delivery companion for students —
            everything from food to parcels, right at your fingertips.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-default"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className={`relative z-10 w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="relative z-10 font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="relative z-10 text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
