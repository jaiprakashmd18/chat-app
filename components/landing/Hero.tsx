"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Clock, ShieldCheck, Zap } from "lucide-react";

const stats = [
  { value: "500+", label: "Restaurants" },
  { value: "10K+", label: "Students" },
  { value: "4.9★", label: "Rating" },
  { value: "30min", label: "Avg Delivery" },
];

const floatingCards = [
  { icon: "🍕", label: "Pizza", color: "bg-orange-50 dark:bg-orange-950/30", delay: 0 },
  { icon: "🍔", label: "Burgers", color: "bg-yellow-50 dark:bg-yellow-950/30", delay: 0.1 },
  { icon: "🥗", label: "Salads", color: "bg-green-50 dark:bg-green-950/30", delay: 0.2 },
  { icon: "🍣", label: "Sushi", color: "bg-blue-50 dark:bg-blue-950/30", delay: 0.3 },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-7xl py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" />
              <span>Georgia's #1 Student Delivery App</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              Food Delivery{" "}
              <span className="text-gradient-orange">Made Easy</span>{" "}
              For Students In Georgia
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed"
            >
              Order from restaurants, request personal pickups, groceries, and parcels —
              all in one place. Built exclusively for students in Georgia.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link
                href="/restaurants"
                className="group flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-primary-600 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
              >
                Order Food
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pickup"
                className="flex items-center gap-2 border-2 border-border text-foreground px-8 py-4 rounded-2xl font-semibold text-lg hover:border-primary hover:text-primary transition-all duration-300 hover:-translate-y-0.5"
              >
                Request Pickup
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-6 text-sm text-muted-foreground"
            >
              {[
                { icon: <ShieldCheck className="w-4 h-4 text-accent" />, text: "Secure Payments" },
                { icon: <Clock className="w-4 h-4 text-primary" />, text: "30 min delivery" },
                { icon: <Star className="w-4 h-4 text-yellow-500" />, text: "4.9/5 rated" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {badge.icon}
                  <span>{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative z-10 bg-card rounded-3xl shadow-2xl p-6 border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-orange rounded-2xl flex items-center justify-center text-2xl">
                  🍔
                </div>
                <div>
                  <p className="font-semibold">Your Order</p>
                  <p className="text-sm text-muted-foreground">#SE123456</p>
                </div>
                <span className="ml-auto text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">
                  On the way
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-3 mb-4">
                {["Order Placed", "Preparing", "Picked Up", "Delivering"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      i <= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {i <= 2 ? "✓" : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        "h-1.5 rounded-full",
                        i < 2 ? "bg-primary" : i === 2 ? "bg-gradient-to-r from-primary to-muted" : "bg-muted"
                      )} />
                    </div>
                    <span className={cn("text-xs", i <= 2 ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ETA</span>
                <span className="font-bold text-primary">12 minutes</span>
              </div>
            </motion.div>

            {/* Floating Food Cards */}
            {floatingCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + card.delay, duration: 0.5 }}
                className={cn(
                  "absolute z-20 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border border-border",
                  card.color,
                  i === 0 ? "-top-6 -left-8" :
                  i === 1 ? "-top-4 right-12" :
                  i === 2 ? "-bottom-4 -left-6" :
                  "bottom-8 -right-8"
                )}
              >
                <span className="text-xl">{card.icon}</span>
                <span className="text-xs font-medium">{card.label}</span>
              </motion.div>
            ))}

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-8 -left-8 bg-card rounded-2xl p-4 shadow-xl border border-border z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Today's Deliveries</p>
                  <p className="font-bold text-lg">1,247</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 p-6 bg-card/50 backdrop-blur-sm rounded-3xl border border-border"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold font-display text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
